# GTM Tracking on Direct-POST Forms (e.g. Mailchimp)

## The Problem

When a form POSTs directly to an external URL (like Mailchimp's `list-manage.com`), the browser navigates away before GTM has a chance to fire any tags. Simply pushing an event to `dataLayer` on `submit` doesn't work — the page is already gone.

This is distinct from Mailchimp's **AJAX embedded popup forms**, where a success element becomes visible on your own page and an Element Visibility trigger works fine. Direct-POST forms send the user to Mailchimp's servers immediately.

## The Solution (Three Parts)

### 1. `eventCallback` + `eventTimeout` — fire tags before navigating

GTM supports a special `eventCallback` property on `dataLayer.push()`. GTM calls this function after all tags for that event have fired, giving you a reliable hook to submit the form only after tracking is complete. `eventTimeout` is a failsafe that submits after N ms even if GTM is slow or blocked.

```javascript
window.dataLayer.push({
  event: 'generate_lead',
  eventCallback: () => { /* submit the form here */ },
  eventTimeout: 2000,
});
```

### 2. Native `form.submit()` via a sandboxed iframe — bypass GTM's patches

GTM patches both `form.submit()` (instance) and `HTMLFormElement.prototype.submit` (prototype) on the main window to detect programmatic submissions and fire its own `form_submit` events. Calling either one from inside `eventCallback` triggers GTM's Form Submission listener, which fires more tags, whose `eventCallback`s call `form.submit()` again — an infinite loop.

**Fix:** borrow the truly native `submit` from a temporary iframe that GTM has never touched:

```javascript
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const nativeSubmit = (iframe.contentWindow as Window).HTMLFormElement.prototype.submit;
document.body.removeChild(iframe);

// later, in eventCallback:
eventCallback: () => { nativeSubmit.call(form); },
```

The iframe is created and destroyed immediately at page load — it's only used to capture a reference to the unpatched method.

### 3. Capture-phase listener + `stopImmediatePropagation()` — block GTM's trigger entirely

GTM's Form Submission trigger registers its own `submit` event listener in the **bubble phase** (the default). It intercepts the original user-click submit event and fires `form_submit` tags — independently of our `eventCallback` — which can also loop.

**Fix:** register our listener in the **capture phase** so it runs before GTM's bubble-phase listener, then call `e.stopImmediatePropagation()` to prevent GTM from ever seeing the event:

```javascript
form.addEventListener('submit', (e) => {
  e.preventDefault();
  e.stopImmediatePropagation(); // GTM never sees this event
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'generate_lead',
    eventCallback: () => { nativeSubmit.call(form); },
    eventTimeout: 2000,
  });
}, { capture: true }); // fires before GTM's bubble-phase listener
```

## Complete Working Implementation

```javascript
const form = document.querySelector('.your-form') as HTMLFormElement | null;
if (form) {
  // Capture native submit before GTM patches it
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  const nativeSubmit = (iframe.contentWindow as Window).HTMLFormElement.prototype.submit;
  document.body.removeChild(iframe);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'generate_lead',
      eventCallback: () => { nativeSubmit.call(form); },
      eventTimeout: 2000,
    });
  }, { capture: true });
}
```

## Why Not Other Approaches?

| Approach | Problem |
|---|---|
| Push to `dataLayer` on `submit` with no delay | Page navigates before GTM fires |
| `form.submit()` in `eventCallback` | GTM's patched instance method loops |
| `HTMLFormElement.prototype.submit.call(form)` | GTM also patches the prototype on the main window — still loops |
| Guard flag + `form.submit()` | Stops our listener re-entering but doesn't stop GTM's own internal loop |
| Turn off Enhanced Measurement | Doesn't help — the loop comes from GTM's built-in Form Submission trigger, not Enhanced Measurement |
| Capture phase alone (no native submit) | Stops GTM seeing the initial click, but `eventCallback` still calls a patched submit |

All three parts are required together.

## Verification

In GTM Preview mode, submit the form and confirm:
1. `generate_lead` appears in the event list with tags fired
2. No runaway `form_submit` events follow it
3. The browser navigates to the external form handler (e.g. Mailchimp)
