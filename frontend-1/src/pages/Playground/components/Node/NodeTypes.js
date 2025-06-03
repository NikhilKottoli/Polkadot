const NODE_TYPES = {
  trigger: {
    id: "trigger",
    label: "Trigger",
    description: "Triggers an event or action.",
    properties: {
      eventType: {
        label: "Event Type",
        type: "string",
        default: "click",
      },
      delay: {
        label: "Delay",
        type: "number",
        default: 0,
      },
    },
    handles: {
      inputs: [
        {
          id: "input-1",
          label: "Input",
          offset: 0,
        },
      ],
      outputs: [
        {
          id: "output-1",
          label: "Output",
          offset: 0,
        },
      ],
    },
  },
  action: {
    id: "action",
    label: "Action",
    description: "Performs an action based on input.",
    properties: {
      actionType: {
        label: "Action Type",
        type: "string",
        default: "send",
      },
      target: {
        label: "Target",
        type: "string",
        default: "",
      },
    },
    handles: {
      inputs: [
        {
          id: "input-1",
          label: "Input",
          offset: 0,
        },
      ],
      outputs: [
        {
          id: "output-1",
          label: "Output",
          offset: 0,
        },
      ],
    },
  },
  logic: {
    id: "logic",
    label: "Logic",
    description: "Processes data and makes decisions.",
    properties: {
      condition: {
        label: "Condition",
        type: "string",
        default: "",
      },
      trueOutput: {
        label: "True Output",
        type: "string",
        default: "",
      },
      falseOutput: {
        label: "False Output",
        type: "string",
        default: "",
      },
    },
    handles: {
      inputs: [
        {
          id: "input-1",
          label: "Input",
          offset: 0,
        },
      ],
      outputs: [
        {
          id: "output-true",
          label: "True Output",
          offset: 0,
        },
        {
          id: "output-false",
          label: "False Output",
          offset: 0,
        },
      ],
    },
  },
  // Additional node types can be added here
};

export default NODE_TYPES;