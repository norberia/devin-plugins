# Longbridge trading safety

The `longbridge` MCP server operates on real brokerage accounts. It can place,
amend, and cancel live orders in US and HK markets.

- Before calling any tool that creates, amends, or cancels an order, show the
  full order details (symbol, side, quantity, order type, price, time-in-force)
  and wait for explicit user confirmation. Summarizing is not confirmation.
- Never auto-retry a rejected or failed order call; report the broker's error
  verbatim and let the user decide.
- Read-only calls (quotes, candlesticks, positions, balances, order status,
  fundamentals, screeners) need no confirmation.
