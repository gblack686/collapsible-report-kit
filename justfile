# List the authoring and review commands.
default:
    @just --list

# Validate the package, catalog, previews, and example coverage.
check:
    node scripts/check-package.mjs
    node scripts/examples.mjs check
    node scripts/style-guide-audit.mjs

# Check that the sweep covers the catalog and every classified source group.
style-guide-check:
    node scripts/style-guide-audit.mjs

# Read-only audit against a GBAutomation checkout; reports changed/missing inputs.
style-guide-audit $CRK_STYLE_GUIDE_ROOT:
    node scripts/style-guide-audit.mjs

# List every example and its stable ID.
examples:
    node scripts/examples.mjs list

# List unique formats separately from their content examples.
formats:
    node scripts/examples.mjs formats

# Swap the content example used on a format's main card.
format-example $CRK_FORMAT $CRK_ID:
    node scripts/examples.mjs representative

# Open the existing style-guide gallery treatment with all CRK examples.
gallery $CRK_PORT="4173":
    node scripts/examples.mjs gallery

# Serve one example over HTTP and open it; Ctrl+C stops the server.
preview $CRK_ID="basic-report" $CRK_PORT="4173":
    node scripts/examples.mjs preview

# Serve without opening a browser (useful for screenshots and CI).
serve $CRK_PORT="4173":
    node scripts/examples.mjs serve

# Clone a starter alongside the original, with a new catalog entry.
example-new $CRK_BASE $CRK_ID:
    node scripts/examples.mjs new

# Change catalog metadata, e.g. title, description, or showcase.
example-set $CRK_ID $CRK_FIELD $CRK_VALUE:
    node scripts/examples.mjs set

# Copy a local PNG/JPEG/WebP into the kit and update its catalog pointer.
preview-image $CRK_ID $CRK_IMAGE:
    node scripts/examples.mjs image

# Generate a portable gallery bundle for the existing style guide.
export-style-guide $CRK_DEST="dist/style-guide/crk":
    node scripts/examples.mjs export

# Import explicit format decisions exported from the review gallery.
review-apply $CRK_REVIEW:
    node scripts/examples.mjs review

# Exercise cloning, replacing previews, stale-review checks, and HTTP serving.
test:
    node --test tests/examples.test.mjs
