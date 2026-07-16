import BaseSystemAdapter from "./base.mjs";

export default class ShadowdarkAdapter extends BaseSystemAdapter {
  getHealthPaths(actor) {
    return {
      hpPath: "system.hp.value",
      tempPath: null,
      tempMaxPath: null,
      damageSystem: false
    };
  }
}
