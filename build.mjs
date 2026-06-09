import { build } from 'esbuild';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

// Step A: Native web component — esbuild, ESM, ES2015.
// Optional chaining (?.), nullish coalescing (??), class fields, and
// logical-assignment operators are all downlevelled by esbuild so that
// Webpack 4 (Angular 10) can parse the bundle without transforms.
await build({
  entryPoints: {
    'albert-date-picker': 'src/index.ts',
  },
  bundle: true,
  format: 'esm',
  outdir: 'dist',
  splitting: false,
  sourcemap: true,
  target: ['es2015'],
  minify: false,
});

// Step B: Angular wrapper — compiled with tsc.
// esbuild cannot emit Reflect.metadata calls (emitDecoratorMetadata), which
// Angular's DI system requires at runtime to resolve constructor injections.
// tsc with target ES2015 also downlevels optional chaining and class fields so
// Webpack 4 / Angular 10 consumers receive syntax they can handle.
// Output goes to angular/ (outDir configured in tsconfig.angular.json).
execSync('npx tsc -p tsconfig.angular.json', { stdio: 'inherit' });

// Step C: Emit angular/package.json and angular/index.metadata.json so
// Angular's ngcc tool can discover, recognise, and process the secondary
// entry point @albert/date-picker/angular.
//
// --- Why angular/package.json is needed ---
// Angular 10 (Ivy) requires third-party Angular libraries to either be
// pre-compiled by @angular/compiler-cli, or be in a format that ngcc can
// transform from View Engine decorator metadata to Ivy instructions.
//
// tsc produces ES2015 modules with __decorate([NgModule(...)]) calls —
// exactly the View Engine format ngcc knows how to process.  ngcc discovers
// secondary entry points by looking for subdirectories that have their own
// package.json.  The esm2015 field identifies the ES2015 module file ngcc
// should transform.
//
// IMPORTANT — use "es2015", not "module" or "esm2015":
//
// Angular 10's @ngtools/webpack calls ngcc with propertiesToConsider set to
// the webpack resolve.mainFields list: ['es2015', 'browser', 'module', 'main'].
// ngcc only processes entry points that have at least one of these properties.
//
// - "esm2015" is NOT in that list → ngcc silently skips the package → NG6002.
// - "module" IS in the list but ngcc maps it to esm5 format, using
//   Esm5RenderingFormatter which expects IIFE-wrapped ES5 classes.  Our tsc
//   output uses native ES2015 class syntax, so it throws:
//     "Compiled class declaration is not inside an IIFE"
// - "es2015" IS in the list AND ngcc maps it to es2015 format, using
//   Esm2015RenderingFormatter which handles native ES2015 class syntax correctly.
//
// --- Why angular/index.metadata.json is needed ---
// Before processing any entry point, ngcc checks whether the package was
// "compiled by Angular" (entry_point.js):
//
//   var compiledByAngular = entryPointConfig !== undefined ||
//                           fs.exists(metadataPath);
//
// where metadataPath is derived from the typings field:
//   angular/index.d.ts  →  angular/index.metadata.json
//
// If this file does not exist, compiledByAngular is false and ngcc
// immediately returns "The target entry-point has already been processed"
// without doing any work — leaving the JS in View Engine __decorate() format
// that ngtsc cannot compile, causing NG6002.
//
// @angular/compiler-cli (ngc) normally emits .metadata.json alongside every
// compiled TypeScript file.  We replicate the index-level file in the Angular
// View Engine metadata format (version 4).  ngcc only needs the file to
// EXIST at this path to enable processing; it reads the __decorate() calls
// directly from the JS for the actual Ivy transformation.
writeFileSync(
  'angular/package.json',
  JSON.stringify(
    {
      name: '@albert/date-picker/angular',
      version: '0.1.0',
      es2015: './index.js',
      typings: './index.d.ts',
      sideEffects: false,
    },
    null,
    2,
  ) + '\n',
);

// Angular View Engine metadata format (version 4).
// This file signals to ngcc that the entry point contains Angular-compiled
// code.  The `exports` list mirrors the public API in src/angular/index.ts.
// The `importAs` value is the module specifier consumers use to import from
// this entry point, which is what Angular's type-checker emits in host
// binding metadata.
writeFileSync(
  'angular/index.metadata.json',
  JSON.stringify(
    {
      '__symbolic': 'module',
      'version': 4,
      'metadata': {},
      'exports': [
        { 'from': './date-picker.module' },
        { 'from': './datetime-picker.module' },
        { 'from': './date-picker-field-cva.directive' },
        { 'from': './datetime-picker-field-cva.directive' },
        { 'from': './datetime-picker-field-cva.component' },
      ],
      'importAs': '@albert/date-picker/angular',
    },
    null,
    2,
  ) + '\n',
);

// NOTE: Do NOT add Ivy stubs (ɵmod: any, ɵfac: any, etc.) to the .d.ts files.
//
// If those stubs are present, Angular 10's ngcc checks for the static property
// declarations in the .d.ts and concludes the library is already Ivy-compiled
// — so it skips the __decorate() transformation entirely.  The JS would
// remain in View Engine format while ngtsc expects Ivy, causing NG6002.

console.log('Build complete ✓');
