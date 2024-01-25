import { Field } from "../Field";

export type HookStateDefinition = {
  name: string;
  description: string;
  hook_states: {
    name?: string;
    description?: string;
    hookstate_key: Field[];
    hookstate_data: Field[];
    foreign_state?: {
      account: string,
      namespace_id: string
    }
  }[];
};


