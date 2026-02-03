/**
 * PostCSS configuration for Tailwind CSS processing and vendor prefixing.
 */
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [tailwindcss(), autoprefixer()]
};
