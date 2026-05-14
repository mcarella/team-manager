// 86-adjective bank for the Behavioral Core instrument.
// Each adjective belongs to one factor with a signed weight (-1..+1):
// positive weight = endorsement raises the factor; negative = lowers it.
// Lifted from docs/references/index/assessment-mock.jsx lines 4-100.
// User-facing labels live in apps/web/src/locales/*/adjectives.json (TBD T8).

export type Factor =
  | 'dominance'      // A
  | 'extraversion'   // B
  | 'patience'       // C
  | 'formality'      // D
  | 'objectivity'    // E — computed but not part of BehavioralCoreFactors v1

export interface Adjective {
  id: string
  factor: Factor
  weight: number
}

export const ADJECTIVES: Adjective[] = [
  // Factor A — Dominance (high)
  { id: 'a01', factor: 'dominance', weight:  0.9  },
  { id: 'a02', factor: 'dominance', weight:  0.8  },
  { id: 'a03', factor: 'dominance', weight:  0.85 },
  { id: 'a04', factor: 'dominance', weight:  0.8  },
  { id: 'a05', factor: 'dominance', weight:  0.9  },
  { id: 'a06', factor: 'dominance', weight:  0.85 },
  { id: 'a07', factor: 'dominance', weight:  0.95 },
  { id: 'a08', factor: 'dominance', weight:  0.9  },
  { id: 'a09', factor: 'dominance', weight:  0.8  },
  { id: 'a10', factor: 'dominance', weight:  0.7  },
  // Factor A — Dominance (low)
  { id: 'a11', factor: 'dominance', weight: -0.8  },
  { id: 'a12', factor: 'dominance', weight: -0.85 },
  { id: 'a13', factor: 'dominance', weight: -0.9  },
  { id: 'a14', factor: 'dominance', weight: -0.7  },
  { id: 'a15', factor: 'dominance', weight: -0.95 },
  { id: 'a16', factor: 'dominance', weight: -0.6  },
  { id: 'a17', factor: 'dominance', weight: -0.7  },
  { id: 'a18', factor: 'dominance', weight: -0.8  },
  { id: 'a19', factor: 'dominance', weight: -0.85 },
  { id: 'a20', factor: 'dominance', weight: -0.5  },
  // Factor B — Extraversion (high)
  { id: 'b01', factor: 'extraversion', weight:  0.85 },
  { id: 'b02', factor: 'extraversion', weight:  0.9  },
  { id: 'b03', factor: 'extraversion', weight:  0.9  },
  { id: 'b04', factor: 'extraversion', weight:  0.8  },
  { id: 'b05', factor: 'extraversion', weight:  0.85 },
  { id: 'b06', factor: 'extraversion', weight:  0.7  },
  { id: 'b07', factor: 'extraversion', weight:  0.85 },
  { id: 'b08', factor: 'extraversion', weight:  0.8  },
  { id: 'b09', factor: 'extraversion', weight:  0.9  },
  { id: 'b10', factor: 'extraversion', weight:  0.75 },
  { id: 'b11', factor: 'extraversion', weight:  0.7  },
  // Factor B — Extraversion (low)
  { id: 'b12', factor: 'extraversion', weight: -0.9  },
  { id: 'b13', factor: 'extraversion', weight: -0.85 },
  { id: 'b14', factor: 'extraversion', weight: -0.7  },
  { id: 'b15', factor: 'extraversion', weight: -0.8  },
  { id: 'b16', factor: 'extraversion', weight: -0.9  },
  { id: 'b17', factor: 'extraversion', weight: -0.75 },
  { id: 'b18', factor: 'extraversion', weight: -0.6  },
  { id: 'b19', factor: 'extraversion', weight: -0.85 },
  { id: 'b20', factor: 'extraversion', weight: -0.5  },
  { id: 'b21', factor: 'extraversion', weight: -0.65 },
  { id: 'b22', factor: 'extraversion', weight: -0.55 },
  // Factor C — Patience (high)
  { id: 'c01', factor: 'patience', weight:  0.9  },
  { id: 'c02', factor: 'patience', weight:  0.95 },
  { id: 'c03', factor: 'patience', weight:  0.85 },
  { id: 'c04', factor: 'patience', weight:  0.8  },
  { id: 'c05', factor: 'patience', weight:  0.85 },
  { id: 'c06', factor: 'patience', weight:  0.8  },
  { id: 'c07', factor: 'patience', weight:  0.75 },
  { id: 'c08', factor: 'patience', weight:  0.7  },
  { id: 'c09', factor: 'patience', weight:  0.65 },
  { id: 'c10', factor: 'patience', weight:  0.7  },
  // Factor C — Patience (low)
  { id: 'c11', factor: 'patience', weight: -0.9  },
  { id: 'c12', factor: 'patience', weight: -0.85 },
  { id: 'c13', factor: 'patience', weight: -0.8  },
  { id: 'c14', factor: 'patience', weight: -0.85 },
  { id: 'c15', factor: 'patience', weight: -0.9  },
  { id: 'c16', factor: 'patience', weight: -0.7  },
  { id: 'c17', factor: 'patience', weight: -0.65 },
  { id: 'c18', factor: 'patience', weight: -0.75 },
  { id: 'c19', factor: 'patience', weight: -0.6  },
  // Factor D — Formality (high)
  { id: 'd01', factor: 'formality', weight:  0.9  },
  { id: 'd02', factor: 'formality', weight:  0.95 },
  { id: 'd03', factor: 'formality', weight:  0.85 },
  { id: 'd04', factor: 'formality', weight:  0.9  },
  { id: 'd05', factor: 'formality', weight:  0.85 },
  { id: 'd06', factor: 'formality', weight:  0.8  },
  { id: 'd07', factor: 'formality', weight:  0.9  },
  { id: 'd08', factor: 'formality', weight:  0.75 },
  { id: 'd09', factor: 'formality', weight:  0.85 },
  { id: 'd10', factor: 'formality', weight:  0.8  },
  // Factor D — Formality (low)
  { id: 'd11', factor: 'formality', weight: -0.85 },
  { id: 'd12', factor: 'formality', weight: -0.9  },
  { id: 'd13', factor: 'formality', weight: -0.85 },
  { id: 'd14', factor: 'formality', weight: -0.8  },
  { id: 'd15', factor: 'formality', weight: -0.7  },
  { id: 'd16', factor: 'formality', weight: -0.75 },
  { id: 'd17', factor: 'formality', weight: -0.6  },
  { id: 'd18', factor: 'formality', weight: -0.8  },
  { id: 'd19', factor: 'formality', weight: -0.7  },
  // Factor E — Objectivity
  { id: 'e01', factor: 'objectivity', weight:  0.8  },
  { id: 'e02', factor: 'objectivity', weight:  0.85 },
  { id: 'e03', factor: 'objectivity', weight:  0.8  },
  { id: 'e04', factor: 'objectivity', weight: -0.75 },
  { id: 'e05', factor: 'objectivity', weight: -0.8  },
  { id: 'e06', factor: 'objectivity', weight: -0.7  },
]
