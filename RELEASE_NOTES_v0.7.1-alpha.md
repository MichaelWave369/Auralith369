# Auralith369 v0.7.1-alpha

## Native WebMCP Site Tools

Auralith369 can now expose structured site tools directly to WebMCP-aware browser agents.

The native path is intentionally thin:

\`\`\`text
browser agent
→ WebMCP
→ Auralith site-tool adapter
→ window.Auralith
→ existing workstation
\`\`\`

The site-tool adapter does not duplicate finishing logic.

## Tool surface

Read-only site tools:

\`\`\`text
auralith_get_capabilities
auralith_search_commands
auralith_list_layers
auralith_get_domistika_transfer
\`\`\`

Bounded action tools:

\`\`\`text
auralith_add_layer
auralith_update_layer
auralith_apply_fx
auralith_apply_lut
auralith_apply_style
auralith_apply_gpu_cartridge
auralith_set_adjustments
auralith_receive_domistika_transfer
auralith_export_receipt
auralith_execute_command
\`\`\`

## Bridge payload hygiene

Domistika transfer site tools return verified metadata summaries and omit the base64 artwork payload from agent context.

The receive path still uses the existing stable bridge and SHA-256 verification flow.

## GPU authority

GPU cartridge tools preserve the existing Auralith boundary:

- Canvas 2D remains authoritative for project pixels, editing, receipts, and standard export.
- GPU Lab remains a non-destructive finishing preview.

## Compatibility

Browsers without WebMCP continue to run Auralith normally.

The frozen \`window.Auralith\` SDK remains unchanged at schema \`auralith.sdk.v1\` and SDK version \`0.1.0\`.

The native site-tool schema begins at:

\`\`\`text
auralith.site-tools.v1
\`\`\`
