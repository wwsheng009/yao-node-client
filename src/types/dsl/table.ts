import YaoAction from "./action";
import YaoComponent from "./component";
import YaoField from "./field";
import YaoHook from "./hook";

export namespace YaoTable {
  export type TableDSL = {
    // root: string;
    id?: string;
    name?: string;
    action: ActionDSL;
    layout: LayoutDSL;
    fields: FieldsDSL;
    config?: { [key: string]: any };
    // c_props: field.CloudProps;
    // computable: compute.Computable;
    // mapping: mapping.Mapping;
  };

  export type ActionDSL = {
    guard?: string;
    bind?: BindActionDSL;
    setting?: YaoAction.Process;
    component?: YaoAction.Process;
    upload?: YaoAction.Process;
    download?: YaoAction.Process;
    search?: YaoAction.Process;
    get?: YaoAction.Process;
    find?: YaoAction.Process;
    save?: YaoAction.Process;
    create?: YaoAction.Process;
    insert?: YaoAction.Process;
    delete?: YaoAction.Process;
    "delete-in"?: YaoAction.Process;
    "delete-where"?: YaoAction.Process;
    update?: YaoAction.Process;
    "update-in"?: YaoAction.Process;
    "update-where"?: YaoAction.Process;
    "before:find"?: YaoHook.Before;
    "after:find"?: YaoHook.After;
    "before:search"?: YaoHook.Before;
    "after:search"?: YaoHook.After;
    "before:get"?: YaoHook.Before;
    "after:get"?: YaoHook.After;
    "before:save"?: YaoHook.Before;
    "after:save"?: YaoHook.After;
    "before:create"?: YaoHook.Before;
    "after:create"?: YaoHook.After;
    "before:insert"?: YaoHook.Before;
    "after:insert"?: YaoHook.After;
    "before:delete"?: YaoHook.Before;
    "after:delete"?: YaoHook.After;
    "before:delete-in"?: YaoHook.Before;
    "after:delete-in"?: YaoHook.After;
    "before:delete-where"?: YaoHook.Before;
    "after:delete-where"?: YaoHook.After;
    "before:update"?: YaoHook.Before;
    "after:update"?: YaoHook.After;
    "before:update-in"?: YaoHook.Before;
    "after:update-in"?: YaoHook.After;
    "before:update-where"?: YaoHook.Before;
    "after:update-where"?: YaoHook.After;
  };

  export type BindActionDSL = {
    model?: string;
    store?: string;
    table?: string;
    form?: string;
    option?: { [key: string]: any };
  };

  export type LayoutDSL = {
    primary?: string;
    header?: HeaderLayoutDSL;
    filter?: FilterLayoutDSL;
    table?: ViewLayoutDSL;
  };

  export type HeaderLayoutDSL = {
    preset?: PresetHeaderDSL;
    actions: YaoComponent.ActionDSL[];
  };

  export type PresetHeaderDSL = {
    batch?: BatchPresetDSL;
    import?: ImportPresetDSL;
  };

  export type BatchPresetDSL = {
    columns?: YaoComponent.InstanceDSL[];
    deletable?: boolean;
  };

  export type ImportPresetDSL = {
    name?: string;
    actions?: YaoComponent.Actions;
  };

  export type FilterLayoutDSL = {
    actions?: YaoComponent.Actions;
    columns?: YaoComponent.Instances;
  };

  export type ViewLayoutDSL = {
    props?: YaoComponent.PropsDSL;
    columns?: YaoComponent.Instances;
    operation?: OperationTableDSL;
  };

  export type OperationTableDSL = {
    width?: number;
    fold?: boolean;
    hide?: boolean;
    actions: YaoComponent.Actions;
  };

  export type FieldsDSL = {
    filter?: YaoField.Filters;
    table?: YaoField.Columns;
    // filter_map: { [key: string]: field.FilterDSL };
    // table_map: { [key: string]: field.ColumnDSL };
  };
}
export default YaoTable;
