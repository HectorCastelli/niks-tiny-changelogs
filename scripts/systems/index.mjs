import BaseSystemAdapter from "./base.mjs";
import Dnd5eAdapter from "./dnd5e.mjs";
import MorkBorgAdapter from "./morkborg.mjs";
import Pf2eAdapter from "./pf2e.mjs";
import ShadowdarkAdapter from "./shadowdark.mjs";
import DemonlordAdapter from "./demonlord.mjs";

export default class SystemManager {
  /**
   * Retrieves the appropriate adapter for the given system ID.
   * If a specific adapter doesn't exist, it falls back to the BaseSystemAdapter.
   * @param {string} systemId 
   * @param {string} modId
   * @returns {BaseSystemAdapter}
   */
  static getAdapter(systemId, modId) {
    switch (systemId) {
      case "dnd5e":
        return new Dnd5eAdapter(modId);
      case "morkborg":
        return new MorkBorgAdapter(modId);
      case "pf2e":
        return new Pf2eAdapter(modId);
      case "shadowdark":
        return new ShadowdarkAdapter(modId);
      case "demonlord":
        return new DemonlordAdapter(modId);
      default:
        return new BaseSystemAdapter(modId);
    }
  }
}
