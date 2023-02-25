export namespace mapping {
  // Mapping common
  export interface Mapping {
    filters: { [key: string]: string };
    columns: { [key: string]: string };
    actions: { [key: string]: string };
  }
}
export default mapping;
