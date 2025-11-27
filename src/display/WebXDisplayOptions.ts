export type WebXFilterOptions = {
  name?: string;
  params?: any;
}

export type WebXDisplayOptions = {
  backgroundColor?: string | number;
  forceCanvas?: boolean;
  disableStencil?: boolean;
  filter?: string | WebXFilterOptions;
}
