export type Policy = {
  documents: {
    resource: string;
    actions: string[];
  }[];
};

export type Result = { value: true; error?: never } | { value: false; error: Error };
