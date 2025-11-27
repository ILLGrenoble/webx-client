/**
 * Stores generic configuration options for display filters
 */
export type WebXFilterOptions = {
  name?: string;
  params?: any;
}

/**
 * Stores configuration settings used by the WebX Display
 */
export type WebXDisplayOptions = {
  backgroundColor?: string | number;
  forceCanvas?: boolean;
  disableStencil?: boolean;
  filter?: string | WebXFilterOptions;
}
