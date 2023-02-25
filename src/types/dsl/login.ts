export namespace YaoLogin {
  export interface LoginDSL {
    id?: string;
    name?: string;
    action?: ActionDSL;
    layout?: LayoutDSL;
    thirdPartyLogin?: ThirdPartyLoginDSL[];
  }

  export interface ActionDSL {
    process?: string;
    args?: string[];
  }

  export interface LayoutDSL {
    entry?: string;
    captcha?: string;
    cover?: string;
    slogan?: string;
    site?: string;
  }

  export interface ThirdPartyLoginDSL {
    title?: string;
    href?: string;
    icon?: string;
    blank?: boolean;
  }
}
export default YaoLogin;
