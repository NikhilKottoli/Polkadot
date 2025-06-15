// Node Types Configuration
export const NODE_TYPES = {
  // 1. TRIGGER NODES - Event Listeners
  trigger: {
    // On-Chain Triggers
    asset_transfer_detected: {
      id: "asset_transfer_detected",
      label: "Asset Transfer Detected",
      icon: "🪙",
      category: "trigger",
      subcategory: "on_chain",
      description:
        "Triggers when an asset transfer is detected on the blockchain",
      handles: {
        outputs: [
          {
            id: "transfer_data",
            label: "Transfer Data",
            type: "transfer_event",
            position: "right",
          },
        ],
      },
      properties: {
        asset_id: { type: "string", default: "", label: "Asset ID" },
        min_amount: { type: "number", default: 0, label: "Minimum Amount" },
        from_address: {
          type: "string",
          default: "",
          label: "From Address (optional)",
        },
        to_address: {
          type: "string",
          default: "",
          label: "To Address (optional)",
        },
      },
    },

    new_asset_created: {
      id: "new_asset_created",
      label: "New Asset Created",
      icon: "🧾",
      category: "trigger",
      subcategory: "on_chain",
      description: "Triggers when a new asset is created on the network",
      handles: {
        outputs: [
          {
            id: "asset_data",
            label: "Asset Data",
            type: "asset_info",
            position: "right",
          },
        ],
      },
      properties: {
        creator_address: {
          type: "string",
          default: "",
          label: "Creator Address (optional)",
        },
        asset_name_pattern: {
          type: "string",
          default: "",
          label: "Asset Name Pattern",
        },
      },
    },

    balance_change_detected: {
      id: "balance_change_detected",
      label: "Balance Change Detected",
      icon: "💰",
      category: "trigger",
      subcategory: "on_chain",
      description: "Triggers when account balance changes",
      handles: {
        outputs: [
          {
            id: "balance_data",
            label: "Balance Data",
            type: "balance_change",
            position: "right",
          },
        ],
      },
      properties: {
        account_address: {
          type: "string",
          default: "",
          label: "Account Address",
        },
        asset_id: { type: "string", default: "DOT", label: "Asset ID" },
        threshold_amount: {
          type: "number",
          default: 0,
          label: "Threshold Amount",
        },
      },
    },

    governance_proposal: {
      id: "governance_proposal",
      label: "New Governance Proposal",
      icon: "🗳️",
      category: "trigger",
      subcategory: "on_chain",
      description: "Triggers when a new governance proposal is submitted",
      handles: {
        outputs: [
          {
            id: "proposal_data",
            label: "Proposal Data",
            type: "governance_event",
            position: "right",
          },
        ],
      },
      properties: {
        proposal_type: {
          type: "select",
          options: ["referendum", "treasury", "council"],
          default: "referendum",
          label: "Proposal Type",
        },
      },
    },

    // Off-Chain Triggers
    scheduled_time: {
      id: "scheduled_time",
      label: "Scheduled Time (Cron)",
      icon: "🕒",
      category: "trigger",
      subcategory: "off_chain",
      description: "Triggers at scheduled intervals using cron expressions",
      handles: {
        outputs: [
          {
            id: "time_event",
            label: "Time Event",
            type: "scheduled_event",
            position: "right",
          },
        ],
      },
      properties: {
        cron_expression: {
          type: "string",
          default: "0 * * * *",
          label: "Cron Expression",
        },
        timezone: { type: "string", default: "UTC", label: "Timezone" },
      },
    },

    webhook_trigger: {
      id: "webhook_trigger",
      label: "Webhook Call",
      icon: "🌐",
      category: "trigger",
      subcategory: "off_chain",
      description: "Triggers when a webhook is called",
      handles: {
        outputs: [
          {
            id: "webhook_data",
            label: "Webhook Data",
            type: "http_request",
            position: "right",
          },
        ],
      },
      properties: {
        webhook_url: {
          type: "string",
          default: "",
          label: "Webhook URL",
          readonly: true,
        },
        auth_required: {
          type: "boolean",
          default: false,
          label: "Require Authentication",
        },
      },
    },

    price_threshold: {
      id: "price_threshold",
      label: "Price Reaches Threshold",
      icon: "📈",
      category: "trigger",
      subcategory: "off_chain",
      description: "Triggers when asset price reaches specified threshold",
      handles: {
        outputs: [
          {
            id: "price_data",
            label: "Price Data",
            type: "price_event",
            position: "right",
          },
        ],
      },
      properties: {
        asset_symbol: { type: "string", default: "DOT", label: "Asset Symbol" },
        threshold_price: {
          type: "number",
          default: 0,
          label: "Threshold Price ($)",
        },
        condition: {
          type: "select",
          options: ["above", "below"],
          default: "above",
          label: "Condition",
        },
      },
    },
  },

  // 2. ACTION NODES
  action: {
    // On-Chain Actions
    transfer_token: {
      id: "transfer_token",
      label: "Transfer Token",
      icon: "🪙",
      category: "action",
      subcategory: "on_chain",
      description: "Transfer tokens to specified address",
      handles: {
        inputs: [
          {
            id: "trigger_input",
            label: "Trigger",
            type: "event",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "transaction_result",
            label: "Transaction Result",
            type: "tx_result",
            position: "right",
          },
        ],
      },
      properties: {
        to_address: { type: "string", default: "", label: "To Address" },
        amount: { type: "number", default: 0, label: "Amount" },
        asset_id: { type: "string", default: "DOT", label: "Asset ID" },
        memo: { type: "string", default: "", label: "Memo (optional)" },
      },
    },

    create_asset: {
      id: "create_asset",
      label: "Create Asset",
      icon: "🆕",
      category: "action",
      subcategory: "on_chain",
      description: "Create a new asset on the blockchain",
      handles: {
        inputs: [
          {
            id: "trigger_input",
            label: "Trigger",
            type: "event",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "asset_created",
            label: "Asset Created",
            type: "asset_result",
            position: "right",
          },
        ],
      },
      properties: {
        asset_name: { type: "string", default: "", label: "Asset Name" },
        asset_symbol: { type: "string", default: "", label: "Asset Symbol" },
        decimals: { type: "number", default: 12, label: "Decimals" },
        min_balance: { type: "number", default: 1, label: "Minimum Balance" },
        total_supply: { type: "number", default: 1000000, label: "Total Supply" },
        admin: { type: "string", default: "", label: "Admin Address" },
        issuer: { type: "string", default: "", label: "Issuer Address" },
        freezer: { type: "string", default: "", label: "Freezer Address" },
      },
    },

    xcm_message: {
      id: "xcm_message",
      label: "XCM Message",
      icon: "✈️",
      category: "action",
      subcategory: "cross_chain",
      description: "Send a cross-chain message (XCM) to another parachain",
      handles: {
        inputs: [
          {
            id: "trigger_input",
            label: "Trigger",
            type: "event",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "xcm_result",
            label: "XCM Result",
            type: "tx_result",
            position: "right",
          },
        ],
      },
      properties: {
        target_chain: {
          type: "string",
          default: "",
          label: "Target Chain/Parachain",
        },
        action_type: {
          type: "select",
          options: ["transfer", "remote_call"],
          default: "transfer",
          label: "Action Type",
        },
        asset: { type: "string", default: "DOT", label: "Asset" },
        amount: { type: "number", default: 0, label: "Amount" },
        destination_address: {
          type: "string",
          default: "",
          label: "Destination Address",
        },
        custom_instructions: {
          type: "textarea",
          default: "",
          label: "Custom Instructions (optional)",
        },
        fee_estimation: {
          type: "string",
          default: "auto",
          label: "Fee Estimation",
          readonly: true,
        },
      },
    },

    mint_asset: {
      id: "mint_asset",
      label: "Mint Asset",
      icon: "🧪",
      category: "action",
      subcategory: "on_chain",
      description: "Mint additional tokens for an existing asset",
      handles: {
        inputs: [
          {
            id: "trigger_input",
            label: "Trigger",
            type: "event",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "mint_result",
            label: "Mint Result",
            type: "tx_result",
            position: "right",
          },
        ],
      },
      properties: {
        asset_id: { type: "string", default: "", label: "Asset ID" },
        amount: { type: "number", default: 0, label: "Amount to Mint" },
        beneficiary: { type: "string", default: "", label: "Beneficiary Address" },
      },
    },

    freeze_asset: {
      id: "freeze_asset",
      label: "Freeze Asset",
      icon: "🧊",
      category: "action",
      subcategory: "on_chain",
      description: "Freeze an asset to prevent transfers",
      handles: {
        inputs: [
          {
            id: "trigger_input",
            label: "Trigger",
            type: "event",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "freeze_result",
            label: "Freeze Result",
            type: "tx_result",
            position: "right",
          },
        ],
      },
      properties: {
        asset_id: { type: "string", default: "", label: "Asset ID" },
        freeze_type: {
          type: "select",
          options: ["account", "asset"],
          default: "asset",
          label: "Freeze Type",
        },
        target_account: { type: "string", default: "", label: "Target Account (if account freeze)" },
      },
    },

    revive_asset: {
      id: "revive_asset",
      label: "Revive Asset",
      icon: "🔄",
      category: "action",
      subcategory: "on_chain",
      description: "Revive a frozen asset to allow transfers",
      handles: {
        inputs: [
          {
            id: "trigger_input",
            label: "Trigger",
            type: "event",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "revive_result",
            label: "Revive Result",
            type: "tx_result",
            position: "right",
          },
        ],
      },
      properties: {
        asset_id: { type: "string", default: "", label: "Asset ID" },
        revive_type: {
          type: "select",
          options: ["account", "asset"],
          default: "asset",
          label: "Revive Type",
        },
        target_account: { type: "string", default: "", label: "Target Account (if account revive)" },
      },
    },

    burn_token: {
      id: "burn_token",
      label: "Burn Token",
      icon: "💥",
      category: "action",
      subcategory: "on_chain",
      description: "Burn specified amount of tokens",
      handles: {
        inputs: [
          {
            id: "trigger_input",
            label: "Trigger",
            type: "event",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "burn_result",
            label: "Burn Result",
            type: "tx_result",
            position: "right",
          },
        ],
      },
      properties: {
        asset_id: { type: "string", default: "", label: "Asset ID" },
        amount: { type: "number", default: 0, label: "Amount to Burn" },
      },
    },

    dao_voting: {
      id: "dao_voting",
      label: "DAO Voting",
      icon: "🗳️",
      category: "action",
      subcategory: "governance",
      description: "Create or participate in DAO voting process",
      handles: {
        inputs: [
          {
            id: "input",
            label: "Input",
            type: "event",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "vote_passed",
            label: "Vote Passed",
            type: "governance_result",
            position: "right",
            offset: -20,
          },
          {
            id: "vote_failed",
            label: "Vote Failed",
            type: "governance_result",
            position: "right",
            offset: 20,
          },
        ],
      },
      properties: {
        proposal_id: { type: "string", default: "", label: "Proposal ID" },
        vote_type: {
          type: "select",
          options: ["yes", "no", "abstain"],
          default: "yes",
          label: "Vote Type",
        },
        voting_power: { type: "number", default: 1, label: "Voting Power" },
        threshold_percentage: { type: "number", default: 51, label: "Pass Threshold %" },
        voting_period_hours: { type: "number", default: 72, label: "Voting Period (hours)" },
      },
    },

    send_telegram: {
      id: "send_telegram",
      label: "Send Telegram Message",
      icon: "📱",
      category: "action",
      subcategory: "notification",
      description: "Send a message via Telegram bot",
      handles: {
        inputs: [
          {
            id: "trigger_input",
            label: "Trigger",
            type: "event",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "message_sent",
            label: "Message Sent",
            type: "notification_result",
            position: "right",
          },
        ],
      },
      properties: {
        chat_id: { 
          type: "string", 
          default: "", 
          label: "Chat ID",
          description: "Telegram chat ID to send message to"
        },
        message_template: { 
          type: "text", 
          default: "", 
          label: "Message Template",
          description: "Message to send. Use {variable} for dynamic values"
        },
        variables: {
          type: "object",
          default: {},
          label: "Variables",
          description: "Variables to use in the message template"
        }
      },
    },

    // Off-Chain Actions
    send_webhook: {
      id: "send_webhook",
      label: "Send Webhook",
      icon: "📤",
      category: "action",
      subcategory: "off_chain",
      description: "Send HTTP POST request to specified URL",
      handles: {
        inputs: [
          { id: "data_input", label: "Data", type: "any", position: "left" },
        ],
        outputs: [
          {
            id: "response",
            label: "Response",
            type: "http_response",
            position: "right",
          },
        ],
      },
      properties: {
        url: { type: "string", default: "", label: "Webhook URL" },
        method: {
          type: "select",
          options: ["POST", "GET", "PUT", "DELETE"],
          default: "POST",
          label: "HTTP Method",
        },
        headers: { type: "object", default: {}, label: "Custom Headers" },
      },
    },

    send_email: {
      id: "send_email",
      label: "Send Email",
      icon: "📤",
      category: "action",
      subcategory: "off_chain",
      description: "Send email notification",
      handles: {
        inputs: [
          {
            id: "message_data",
            label: "Message Data",
            type: "any",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "email_result",
            label: "Email Result",
            type: "delivery_status",
            position: "right",
          },
        ],
      },
      properties: {
        to_email: { type: "string", default: "", label: "To Email" },
        subject: {
          type: "string",
          default: "Workflow Notification",
          label: "Subject",
        },
        template: { type: "text", default: "", label: "Email Template" },
      },
    },

    // Liquidity & Staking Actions
    provide_liquidity: {
      id: "provide_liquidity",
      label: "Provide Liquidity",
      icon: "💸",
      category: "action",
      subcategory: "liquidity_staking",
      description: "Provide liquidity to a liquidity pool",
      handles: {
        inputs: [
          {
            id: "trigger_input",
            label: "Trigger",
            type: "event",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "liquidity_provided",
            label: "Liquidity Provided",
            type: "liquidity_result",
            position: "right",
          },
        ],
      },
      properties: {
        pool_id: { type: "string", default: "", label: "Pool ID" },
        asset_a: { type: "string", default: "DOT", label: "Asset A" },
        asset_b: { type: "string", default: "DOT", label: "Asset B" },
        amount_a: { type: "number", default: 0, label: "Amount A" },
        amount_b: { type: "number", default: 0, label: "Amount B" },
      },
    },
  },

  // 3. LOGIC & UTILITY NODES
  logic: {
    if_else_logic: {
      id: "if_else_logic",
      label: "If / Else Logic",
      icon: "🧠",
      category: "logic",
      subcategory: "control_flow",
      description: "Conditional logic branching",
      handles: {
        inputs: [
          {
            id: "input",
            label: "Input",
            type: "any",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "true",
            label: "True",
            type: "any",
            position: "right",
            offset: -20,
          },
          {
            id: "false",
            label: "False",
            type: "any",
            position: "right",
            offset: 20,
          },
        ],
      },
      properties: {
        condition_type: {
          type: "select",
          options: ["equals", "greater_than", "less_than", "contains"],
          default: "equals",
          label: "Condition Type",
        },
        compare_value: { type: "string", default: "", label: "Compare Value" },
        case_sensitive: {
          type: "boolean",
          default: true,
          label: "Case Sensitive",
        },
      },
    },

    math_operation: {
      id: "math_operation",
      label: "Math Operation",
      icon: "🧮",
      category: "logic",
      subcategory: "data_processing",
      description: "Perform mathematical operations on input data",
      handles: {
        inputs: [
          {
            id: "number_a",
            label: "Number A",
            type: "number",
            position: "left",
            offset: -10,
          },
          {
            id: "number_b",
            label: "Number B",
            type: "number",
            position: "left",
            offset: 10,
          },
        ],
        outputs: [
          { id: "result", label: "Result", type: "number", position: "right" },
        ],
      },
      properties: {
        operation: {
          type: "select",
          options: ["add", "subtract", "multiply", "divide", "power", "modulo"],
          default: "add",
          label: "Operation",
        },
        decimal_places: { type: "number", default: 2, label: "Decimal Places" },
      },
    },

    data_formatter: {
      id: "data_formatter",
      label: "Data Formatter",
      icon: "🧩",
      category: "logic",
      subcategory: "data_processing",
      description: "Format and transform data between different types",
      handles: {
        inputs: [
          { id: "raw_data", label: "Raw Data", type: "any", position: "left" },
        ],
        outputs: [
          {
            id: "formatted_data",
            label: "Formatted Data",
            type: "any",
            position: "right",
          },
        ],
      },
      properties: {
        input_format: {
          type: "select",
          options: ["string", "json", "base64", "hex"],
          default: "string",
          label: "Input Format",
        },
        output_format: {
          type: "select",
          options: ["string", "json", "base64", "hex"],
          default: "json",
          label: "Output Format",
        },
        custom_template: {
          type: "text",
          default: "",
          label: "Custom Template",
        },
      },
    },

    // Loop Control Nodes
    for_loop: {
      id: "for_loop",
      label: "For Loop",
      icon: "🔄",
      category: "logic",
      subcategory: "control_flow",
      description: "Execute actions for a specific number of iterations",
      handles: {
        inputs: [
          {
            id: "input",
            label: "Input",
            type: "any",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "continue",
            label: "Continue",
            type: "control",
            position: "right",
            offset: -20,
          },
          {
            id: "complete",
            label: "Complete",
            type: "control",
            position: "right",
            offset: 20,
          },
        ],
      },
      properties: {
        loop_type: {
          type: "select",
          options: ["array", "range", "count"],
          default: "count",
          label: "Loop Type",
        },
        start_value: { type: "number", default: 0, label: "Start Value" },
        end_value: { type: "number", default: 10, label: "End Value" },
        step: { type: "number", default: 1, label: "Step" },
      },
    },

    while_loop: {
      id: "while_loop",
      label: "While Loop",
      icon: "🔁",
      category: "logic",
      subcategory: "control_flow",
      description: "Execute actions while a condition is true",
      handles: {
        inputs: [
          {
            id: "input",
            label: "Input",
            type: "boolean",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "continue",
            label: "Continue",
            type: "control",
            position: "right",
            offset: -20,
          },
          {
            id: "break",
            label: "Break",
            type: "control",
            position: "right",
            offset: 20,
          },
        ],
      },
      properties: {
        max_iterations: { type: "number", default: 100, label: "Max Iterations" },
        timeout_seconds: { type: "number", default: 30, label: "Timeout (seconds)" },
      },
    },

    switch_logic: {
      id: "switch_logic",
      label: "Switch Statement",
      icon: "🔀",
      category: "logic",
      subcategory: "control_flow",
      description: "Multi-way branching based on value matching",
      handles: {
        inputs: [
          {
            id: "input",
            label: "Input",
            type: "any",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "case1",
            label: "Case 1",
            type: "any",
            position: "right",
            offset: -30,
          },
          {
            id: "case2",
            label: "Case 2",
            type: "any",
            position: "right",
            offset: -10,
          },
          {
            id: "case3",
            label: "Case 3",
            type: "any",
            position: "right",
            offset: 10,
          },
          {
            id: "default",
            label: "Default",
            type: "any",
            position: "right",
            offset: 30,
          },
        ],
      },
      properties: {
        case1_value: { type: "string", default: "", label: "Case 1 Value" },
        case2_value: { type: "string", default: "", label: "Case 2 Value" },
        case3_value: { type: "string", default: "", label: "Case 3 Value" },
        case_sensitive: { type: "boolean", default: true, label: "Case Sensitive" },
      },
    },

    parallel_execution: {
      id: "parallel_execution",
      label: "Parallel Execution",
      icon: "⚡",
      category: "logic",
      subcategory: "control_flow",
      description: "Execute multiple branches in parallel",
      handles: {
        inputs: [
          {
            id: "input",
            label: "Input",
            type: "any",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "branch1",
            label: "Branch 1",
            type: "any",
            position: "right",
            offset: -20,
          },
          {
            id: "branch2",
            label: "Branch 2",
            type: "any",
            position: "right",
            offset: 0,
          },
          {
            id: "branch3",
            label: "Branch 3",
            type: "any",
            position: "right",
            offset: 20,
          },
        ],
      },
      properties: {
        wait_for_all: { type: "boolean", default: true, label: "Wait for All Branches" },
        timeout_seconds: { type: "number", default: 60, label: "Timeout (seconds)" },
      },
    },
  },

  // 4. BRIDGE & INTEROPERABILITY NODES
  bridge: {
    polkadot_bridge: {
      id: "polkadot_bridge",
      label: "Polkadot Bridge Node",
      icon: "🔗",
      category: "bridge",
      subcategory: "interoperability",
      description: "Bridge assets between Polkadot parachains",
      handles: {
        inputs: [
          {
            id: "asset_input",
            label: "Asset Input",
            type: "asset",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "bridged_asset",
            label: "Bridged Asset",
            type: "asset",
            position: "right",
          },
        ],
      },
      properties: {
        source_chain: {
          type: "select",
          options: ["AssetHub", "Moonbeam", "Astar", "Acala"],
          default: "AssetHub",
          label: "Source Chain",
        },
        destination_chain: {
          type: "select",
          options: ["AssetHub", "Moonbeam", "Astar", "Acala"],
          default: "Moonbeam",
          label: "Destination Chain",
        },
        bridge_fee: { type: "number", default: 0.1, label: "Bridge Fee (%)" },
      },
    },

    token_swap: {
      id: "token_swap",
      label: "Token Swap Node",
      icon: "🖇️",
      category: "bridge",
      subcategory: "defi",
      description: "Swap tokens using DEX integration",
      handles: {
        inputs: [
          {
            id: "input_token",
            label: "Input Token",
            type: "asset",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "output_token",
            label: "Output Token",
            type: "asset",
            position: "right",
          },
        ],
      },
      properties: {
        dex_protocol: {
          type: "select",
          options: ["HydraDX", "Uniswap", "PancakeSwap"],
          default: "HydraDX",
          label: "DEX Protocol",
        },
        slippage_tolerance: {
          type: "number",
          default: 1,
          label: "Slippage Tolerance (%)",
        },
        min_output_amount: {
          type: "number",
          default: 0,
          label: "Min Output Amount",
        },
      },
    },
  },

  // 5. WALLET/USER INTERACTION NODES
  wallet: {
    sign_transaction: {
      id: "sign_transaction",
      label: "Sign Transaction",
      icon: "🔐",
      category: "wallet",
      subcategory: "user_interaction",
      description: "Request user signature for transaction",
      handles: {
        inputs: [
          {
            id: "transaction_data",
            label: "Transaction Data",
            type: "transaction",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "signed_transaction",
            label: "Signed Transaction",
            type: "signed_tx",
            position: "right",
          },
        ],
      },
      properties: {
        require_confirmation: {
          type: "boolean",
          default: true,
          label: "Require User Confirmation",
        },
        timeout_seconds: {
          type: "number",
          default: 60,
          label: "Timeout (seconds)",
        },
      },
    },

    generate_wallet: {
      id: "generate_wallet",
      label: "Generate Wallet",
      icon: "🧾",
      category: "wallet",
      subcategory: "key_management",
      description: "Generate new wallet with mnemonic",
      handles: {
        inputs: [
          { id: "trigger", label: "Trigger", type: "event", position: "left" },
        ],
        outputs: [
          {
            id: "wallet_info",
            label: "Wallet Info",
            type: "wallet_data",
            position: "right",
          },
        ],
      },
      properties: {
        mnemonic_length: {
          type: "select",
          options: ["12", "24"],
          default: "12",
          label: "Mnemonic Length",
        },
        derivation_path: {
          type: "string",
          default: "//0",
          label: "Derivation Path",
        },
      },
    },
  },

  // 6. AI/ML NODES
  ai: {
    gemini_completion: {
      id: "gemini_completion",
      label: "Gemini AI Completion",
      icon: "🧠",
      category: "ai",
      subcategory: "language_model",
      description: "Generate text using Google's Gemini AI model",
      handles: {
        inputs: [
          {
            id: "prompt_input",
            label: "Prompt",
            type: "string",
            position: "left",
          },
        ],
        outputs: [
          {
            id: "completion_output",
            label: "Completion",
            type: "string",
            position: "right",
          },
        ],
      },
      properties: {
        model: {
          type: "select",
          options: ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash-lite"],
          default: "gemini-1.5-flash",
          label: "Model", 
        },
        max_tokens: { type: "number", default: 150, label: "Max Tokens" },
        temperature: {
          type: "number",
          default: 0.7,
          min: 0,
          max: 2,
          step: 0.1,
          label: "Temperature",
        },
      },
    },
  },
};

// Helper function to get node type by ID
export const getNodeTypeById = (nodeId) => {
  for (const category of Object.values(NODE_TYPES)) {
    if (category[nodeId]) {
      return category[nodeId];
    }
  }
  return null;    
};

// Helper function to get all node types in a category
export const getNodeTypesByCategory = (categoryName) => {
  return NODE_TYPES[categoryName] || {};
};

// Helper function to get all categories
export const getAllCategories = () => {
  return Object.keys(NODE_TYPES);
};
