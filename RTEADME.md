# Astro Remove Comments Integration

A Astro integration that removes HTML comments, JavaScript comments within `<script>` tags, and CSS comments within `<style>` tags from HTML files during the build process.
This integration helps optimize your static site by reducing file size and removing development-related comments, ensuring cleaner output for production.

## Features

- Removes all HTML comments (e.g., <!-- comment -->) from .html files.
- Removes single-line (//) and multi-line (/\* \*/) JavaScript comments from <script> tags.
- Removes CSS comments (e.g., /_ comment _/) from <style> tags.
- Recursively processes all .html files in the Astro build output directory.
- Safe parsing using jsdom for HTML, acorn/astring for JavaScript, and css for CSS, avoiding regex-based issues.
- Detailed logging with counts of removed HTML, JavaScript, and CSS comments.
