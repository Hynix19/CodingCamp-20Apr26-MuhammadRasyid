// Property tests for QuickLinks module
// Feature: todo-life-dashboard

// Property 13: Invalid quick-link input is always rejected
// Feature: todo-life-dashboard, Property 13: Invalid quick-link input is always rejected
propertyTest('Property 13: Invalid quick-link input is always rejected', () => {
  fc.assert(
    fc.property(
      // Generate either empty string or arbitrary string for label
      fc.oneof(fc.constant(''), fc.string()),
      // Generate arbitrary string for URL (most won't be valid URLs)
      fc.string(),
      (label, url) => {
        const originalLinks = [...QuickLinks.links];
        const originalLength = QuickLinks.links.length;

        // Determine if this input should be rejected
        const trimmedLabel = label.trim();
        const isLabelEmpty = trimmedLabel.length === 0;
        const isLabelTooLong = trimmedLabel.length > 30;
        let isUrlInvalid = false;
        try {
          new URL(url.trim());
        } catch {
          isUrlInvalid = true;
        }

        const shouldReject = isLabelEmpty || isLabelTooLong || isUrlInvalid;

        QuickLinks.addLink(label, url);

        const newLength = QuickLinks.links.length;

        // Restore
        QuickLinks.links = originalLinks;

        if (shouldReject) {
          return newLength === originalLength;
        }
        // If valid, it should have been added
        return newLength === originalLength + 1;
      }
    ),
    { numRuns: 100 }
  );
});
