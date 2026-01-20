import { useEffect, useMemo, useRef, useState } from "react";
import { fetchTop30AddressFlows } from "../lib/gmgnApi";
import { AddressFlow, calculateTop30Totals } from "../lib/gmgnData";

const formatUsd = (value: number): string =>
  value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  });

const getNetTone = (netUsd: number): "positive" | "negative" | "neutral" => {
  if (netUsd > 0) {
    return "positive";
  }
  if (netUsd < 0) {
    return "negative";
  }
  return "neutral";
};

export const FlowPanel = () => {
  const [token, setToken] = useState("");
  const [rows, setRows] = useState<AddressFlow[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 24, y: 120 });
  const dragOffset = useRef<{ x: number; y: number } | null>(null);

  const totals = useMemo(() => calculateTop30Totals(rows), [rows]);
  const netTone = getNetTone(totals.netUsd);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!dragOffset.current) {
        return;
      }
      setPosition({
        x: event.clientX - dragOffset.current.x,
        y: event.clientY - dragOffset.current.y
      });
    };

    const handleMouseUp = () => {
      dragOffset.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    dragOffset.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y
    };
  };

  const handleFetch = async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const flows = await fetchTop30AddressFlows(token);
      setRows(flows);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load GMGN data"
      );
    }
  };

  return (
    <section
      className="gmgn-panel"
      style={{ left: position.x, top: position.y }}
    >
      <header className="gmgn-panel__header" onMouseDown={handleMouseDown}>
        <div>
          <strong>GMGN Top30 Flow</strong>
          <p>Drag this panel anywhere on the page.</p>
        </div>
        <span className={`gmgn-panel__status gmgn-panel__status--${status}`}>
          {status === "loading" ? "Loading" : "Ready"}
        </span>
      </header>
      <div className="gmgn-panel__body">
        <label className="gmgn-panel__label" htmlFor="gmgn-token-input">
          Token address
        </label>
        <div className="gmgn-panel__controls">
          <input
            id="gmgn-token-input"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste token address"
            className="gmgn-panel__input"
          />
          <button
            type="button"
            onClick={handleFetch}
            className="gmgn-panel__button"
            disabled={status === "loading"}
          >
            Fetch
          </button>
        </div>
        {errorMessage ? (
          <div className="gmgn-panel__error">{errorMessage}</div>
        ) : null}
        <div className="gmgn-panel__summary">
          <div>
            <span>Total buy</span>
            <strong>{formatUsd(totals.totalBuyUsd)}</strong>
          </div>
          <div>
            <span>Total sell</span>
            <strong>{formatUsd(totals.totalSellUsd)}</strong>
          </div>
          <div className={`gmgn-panel__net gmgn-panel__net--${netTone}`}>
            <span>Net</span>
            <strong>{formatUsd(totals.netUsd)}</strong>
          </div>
        </div>
        <div className="gmgn-panel__rows">
          {rows.length === 0 ? (
            <p className="gmgn-panel__empty">No rows loaded yet.</p>
          ) : (
            rows.map((row) => (
              <div key={row.address} className="gmgn-panel__row">
                <span>{row.address}</span>
                <span>{formatUsd(row.buyUsd)}</span>
                <span>{formatUsd(row.sellUsd)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
