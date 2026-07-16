import BaseSystemAdapter from "./base.mjs";

export default class Pf2eAdapter extends BaseSystemAdapter {
  getHealthPaths(actor) {
    return {
      hpPath: "system.attributes.hp.value",
      tempPath: "system.attributes.hp.temp",
      tempMaxPath: null,
      damageSystem: false
    };
  }

  getCurrencyInfo(actor, manualBase) {
    const candidates = manualBase ? [manualBase] : ["system.currencies", "system.currency"];

    let basePath = null, obj = null;
    for (const p of candidates) {
      const o = foundry.utils.getProperty(actor, p);
      if (o && typeof o === "object") { basePath = p; obj = o; break; }
    }
    if (!basePath) return { basePath: null, coins: [], isFlatCurrency: false };

    const all = ["pp", "gp", "ep", "sp", "cp"];
    const coins = all.filter(k => Object.prototype.hasOwnProperty.call(obj, k));
    return { basePath, coins, isFlatCurrency: false };
  }

  getCoinLabel(denom) {
    const labels = { pp: "Platinum", gp: "Gold", sp: "Silver", cp: "Copper" };
    return labels[denom] ?? super.getCoinLabel(denom);
  }
}
