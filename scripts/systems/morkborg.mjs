import BaseSystemAdapter from "./base.mjs";

export default class MorkBorgAdapter extends BaseSystemAdapter {
  registerSettings() {
    game.settings.register(this.MOD_ID, "trackMorkBorgOmens", {
      name: "Track Omens",
      hint: "If enabled, logs when a character gains or uses Omens.",
      scope: "world", config: true, type: Boolean, default: true
    });

    game.settings.register(this.MOD_ID, "trackMorkBorgPowers", {
      name: "Track Powers",
      hint: "If enabled, logs when a character uses or recovers Powers.",
      scope: "world", config: true, type: Boolean, default: true
    });
  }

  getHealthPaths(actor) {
    return {
      hpPath: "system.hp.value",
      tempPath: null,
      tempMaxPath: null,
      damageSystem: false
    };
  }

  getCurrencyInfo(actor, manualBase) {
    if (manualBase) return super.getCurrencyInfo(actor, manualBase);

    // Mörk Borg: silver is a flat number at system.silver, not inside a currency sub-object
    const silverPath = "system.silver";
    const v = foundry.utils.getProperty(actor, silverPath);
    if (Number.isFinite(Number(v))) return { basePath: null, coins: [silverPath], isFlatCurrency: true };
    return { basePath: null, coins: [], isFlatCurrency: false };
  }

  getCoinLabel(denom) {
    // Mörk Borg uses full paths as coin keys (e.g. "system.silver")
    if (denom === "system.silver") return "Silver";
    return super.getCoinLabel(denom);
  }

  buildPreUpdatePayload(actor, update, context) {
    const payload = {};

    // Omens
    if (context.getWorldBool("trackMorkBorgOmens", true)) {
      const omensPath = "system.omens.value";
      if (context.willUpdatePath(update, omensPath)) {
        payload.oldInspiration = context.readNumber(actor, omensPath);
        payload.hasInspiration = true;
      }
    }

    // Powers
    if (context.getWorldBool("trackMorkBorgPowers", true)) {
      const powerPath = "system.powerUses.value";
      if (context.willUpdatePath(update, powerPath) && foundry.utils.hasProperty(actor, powerPath)) {
        // Stash it as level 0 spell slot for consistency with generic processing
        payload.spellSlots = [{ level: 0, path: powerPath, oldValue: context.readNumber(actor, powerPath) }];
      }
    }

    return Object.keys(payload).length > 0 ? payload : null;
  }

  async processActorUpdate(actor, payload, context) {
    const { link, postMonitorMessage, readNumber, getWorldBool } = context;

    // Omens
    if (payload.hasInspiration && payload.oldInspiration !== undefined) {
      const omensPath = "system.omens.value";
      const newOmens = readNumber(actor, omensPath);
      const delta = newOmens - payload.oldInspiration;
      if (delta !== 0) {
        const icon = `<i class="fa-solid fa-dice-d20"></i>`;
        const sign = delta > 0 ? "+" : "-";
        const abs = Math.abs(delta);
        const isSimple = getWorldBool("simpleOutput");
        const cls = delta > 0 ? "tiny-monitor-omens-gain" : "tiny-monitor-omens-loss";

        const text = isSimple
          ? `Omens: ${sign} ${abs}`
          : `Omens: ${payload.oldInspiration} ${sign} ${abs} → ${newOmens}`;

        const line = `${icon} <span class="tm-actor">${link}</span> <span class="tm-text">${text}</span>`;
        await postMonitorMessage(actor, line, cls, "omens");
      }
    }

    // Powers (Spell Slots)
    if (payload.spellSlots && payload.spellSlots.length > 0) {
      const slotData = payload.spellSlots[0];
      if (slotData) {
        const newVal = readNumber(actor, slotData.path);
        const oldVal = slotData.oldValue;
        const delta = newVal - oldVal;

        if (delta !== 0) {
          const icon = `<i class="fa-solid fa-hat-wizard"></i>`;
          const sign = delta > 0 ? "+" : "-";
          const action = delta < 0 ? "used" : "recovered";
          const cls = delta < 0 ? "tiny-monitor-spellslot-expend" : "tiny-monitor-spellslot-regain";
          const absDelta = Math.abs(delta);
          const isSimple = getWorldBool("simpleOutput");

          const text = isSimple
            ? `Powers: ${sign} ${absDelta}`
            : `Powers: ${action} ${absDelta === 1 ? "a" : absDelta} ${absDelta === 1 ? "power" : "powers"}`;

          const line = `${icon} <span class="tm-actor">${link}</span> <span class="tm-text">${text}</span>`;
          await postMonitorMessage(actor, line, cls, "spellslot");
        }
      }
    }
  }
}
