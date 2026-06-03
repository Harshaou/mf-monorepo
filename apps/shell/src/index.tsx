/**
 * Async boundary (mandatory for Module Federation).
 *
 * Because react/react-dom and the design system are SHARED, execution must pause here
 * to negotiate and download the shared copies before any app code runs. The dynamic
 * import is what creates that pause.
 */
import('./bootstrap');

export {};
