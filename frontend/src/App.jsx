import { useMemo, useState } from 'react'

const demoState = {
  federation_id: 'fed-mainnet-comunidade-porto-alegre',
  community_name: 'Cooperativa Bitcoin Bairro Livre',
  member_count: 186,
  guardians_online: 7,
  guardians_total: 9,
  social_recovery_enabled: true,
  tier: 'Community Federation',
  fiat_reference_brl: 32145.22,
  onchain_balance_sats: 854321,
  lightning_balance_sats: 1265420,
  ecash_balance_sats: 650000,
  monthly_volume_sats: 18900000,
  pending_operations: [
    {
      id: 'op-1',
      rail: 'lightning',
      kind: 'receive',
      amount_sats: 32000,
      status: 'completed',
      description: 'Venda na feira comunitária',
      time: '09:12',
    },
    {
      id: 'op-2',
      rail: 'onchain',
      kind: 'send',
      amount_sats: 210000,
      status: 'completed',
      description: 'Movimentação para cold federation',
      time: '08:40',
    },
    {
      id: 'op-3',
      rail: 'ecash',
      kind: 'receive',
      amount_sats: 18000,
      status: 'pending',
      description: 'Contribuição caixa coletiva',
      time: '07:58',
    },
  ],
}

const templateReceive = {
  rail: 'lightning',
  amount_sats: 1200,
  memo: '',
}

const templateSend = {
  rail: 'lightning',
  amount_sats: 1000,
  destination: '',
  memo: '',
}

function sats(value) {
  return Number(value || 0).toLocaleString('pt-BR')
}

function App() {
  const [wallet, setWallet] = useState(demoState)
  const [mode, setMode] = useState('demo')
  const [activeTab, setActiveTab] = useState('receive')
  const [receiveForm, setReceiveForm] = useState(templateReceive)
  const [sendForm, setSendForm] = useState(templateSend)
  const [output, setOutput] = useState('')

  const totalBalance = useMemo(() => {
    return wallet.onchain_balance_sats + wallet.lightning_balance_sats + wallet.ecash_balance_sats
  }, [wallet])

  const setRailBadge = (rail) => {
    if (rail === 'lightning') return 'badge ln'
    if (rail === 'onchain') return 'badge chain'
    return 'badge ecash'
  }

  const simulateReceive = () => {
    const op = {
      id: crypto.randomUUID(),
      rail: receiveForm.rail,
      kind: 'receive',
      amount_sats: receiveForm.amount_sats,
      status: 'completed',
      description: receiveForm.memo || 'Recebimento comunitário',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }

    setWallet((current) => {
      const next = { ...current, pending_operations: [op, ...current.pending_operations].slice(0, 10) }
      if (receiveForm.rail === 'lightning') next.lightning_balance_sats += receiveForm.amount_sats
      else if (receiveForm.rail === 'onchain') next.onchain_balance_sats += receiveForm.amount_sats
      else next.ecash_balance_sats += receiveForm.amount_sats
      return next
    })

    setOutput(
      JSON.stringify(
        {
          invoice_or_address:
            receiveForm.rail === 'lightning'
              ? `lnbc${receiveForm.amount_sats}fedimintdemo${Math.floor(Math.random() * 9999)}`
              : receiveForm.rail === 'onchain'
                ? `bc1qfedimintcommunity${Math.floor(Math.random() * 99999)}`
                : `ecash-token-fedimint-${Math.floor(Math.random() * 9999)}`,
          operation: op,
          simulated: true,
        },
        null,
        2,
      ),
    )
  }

  const simulateSend = () => {
    const op = {
      id: crypto.randomUUID(),
      rail: sendForm.rail,
      kind: 'send',
      amount_sats: sendForm.amount_sats,
      status: 'completed',
      description: sendForm.memo || `Envio para ${sendForm.destination || 'destino teste'}`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }

    setWallet((current) => {
      const next = { ...current, pending_operations: [op, ...current.pending_operations].slice(0, 10) }
      if (sendForm.rail === 'lightning') next.lightning_balance_sats = Math.max(0, next.lightning_balance_sats - sendForm.amount_sats)
      else if (sendForm.rail === 'onchain') next.onchain_balance_sats = Math.max(0, next.onchain_balance_sats - sendForm.amount_sats)
      else next.ecash_balance_sats = Math.max(0, next.ecash_balance_sats - sendForm.amount_sats)
      return next
    })

    setOutput(
      JSON.stringify(
        {
          federation_proof: `fed-proof-demo-${Math.floor(Math.random() * 100000)}`,
          operation: op,
          simulated: true,
        },
        null,
        2,
      ),
    )
  }

  return (
    <main className="wallet-shell">
      <header className="hero card">
        <div>
          <p className="eyebrow">Fedimint Community Wallet</p>
          <h1>Carteira Comunitária Ideal</h1>
          <p className="muted">
            Interface de referência para ecossistema Fedimint: foco em comunidade, resiliência,
            rails BTC/LN/eCash e UX de uso diário.
          </p>
        </div>
        <div className="status-stack">
          <div className="pill online">Guardiões online: {wallet.guardians_online}/{wallet.guardians_total}</div>
          <div className="pill">Modo: {mode === 'demo' ? 'Demo local (sem backend)' : 'Conectado'}</div>
          <button className="ghost" onClick={() => setMode((m) => (m === 'demo' ? 'online' : 'demo'))}>
            Alternar modo
          </button>
        </div>
      </header>

      <section className="kpi-grid">
        <article className="card kpi">
          <p>Total sob custódia federada</p>
          <h2>{sats(totalBalance)} sats</h2>
        </article>
        <article className="card kpi">
          <p>Saldo Lightning</p>
          <h2>{sats(wallet.lightning_balance_sats)} sats</h2>
        </article>
        <article className="card kpi">
          <p>Saldo On-chain</p>
          <h2>{sats(wallet.onchain_balance_sats)} sats</h2>
        </article>
        <article className="card kpi">
          <p>Saldo eCash local</p>
          <h2>{sats(wallet.ecash_balance_sats)} sats</h2>
        </article>
      </section>

      <section className="layout-grid">
        <article className="card federation">
          <h3>Identidade da Federação</h3>
          <div className="meta">
            <span>ID</span>
            <strong>{wallet.federation_id}</strong>
            <span>Comunidade</span>
            <strong>{wallet.community_name}</strong>
            <span>Membros ativos</span>
            <strong>{wallet.member_count}</strong>
            <span>Recuperação social</span>
            <strong>{wallet.social_recovery_enabled ? 'Ativada' : 'Desativada'}</strong>
            <span>Volume mensal</span>
            <strong>{sats(wallet.monthly_volume_sats)} sats</strong>
          </div>
        </article>

        <article className="card actions">
          <div className="tabs">
            <button className={activeTab === 'receive' ? 'tab active' : 'tab'} onClick={() => setActiveTab('receive')}>
              Receber
            </button>
            <button className={activeTab === 'send' ? 'tab active' : 'tab'} onClick={() => setActiveTab('send')}>
              Enviar
            </button>
          </div>

          {activeTab === 'receive' ? (
            <div className="form-grid">
              <label>
                Rede
                <select value={receiveForm.rail} onChange={(e) => setReceiveForm((f) => ({ ...f, rail: e.target.value }))}>
                  <option value="lightning">Lightning</option>
                  <option value="onchain">On-chain</option>
                  <option value="ecash">eCash</option>
                </select>
              </label>
              <label>
                Quantia (sats)
                <input
                  type="number"
                  min="1"
                  value={receiveForm.amount_sats}
                  onChange={(e) => setReceiveForm((f) => ({ ...f, amount_sats: Number(e.target.value) }))}
                />
              </label>
              <label>
                Memo
                <input value={receiveForm.memo} onChange={(e) => setReceiveForm((f) => ({ ...f, memo: e.target.value }))} />
              </label>
              <button onClick={simulateReceive}>Gerar cobrança</button>
            </div>
          ) : (
            <div className="form-grid">
              <label>
                Rede
                <select value={sendForm.rail} onChange={(e) => setSendForm((f) => ({ ...f, rail: e.target.value }))}>
                  <option value="lightning">Lightning</option>
                  <option value="onchain">On-chain</option>
                  <option value="ecash">eCash</option>
                </select>
              </label>
              <label>
                Quantia (sats)
                <input
                  type="number"
                  min="1"
                  value={sendForm.amount_sats}
                  onChange={(e) => setSendForm((f) => ({ ...f, amount_sats: Number(e.target.value) }))}
                />
              </label>
              <label>
                Destino
                <input
                  placeholder="invoice, endereço ou token"
                  value={sendForm.destination}
                  onChange={(e) => setSendForm((f) => ({ ...f, destination: e.target.value }))}
                />
              </label>
              <label>
                Memo
                <input value={sendForm.memo} onChange={(e) => setSendForm((f) => ({ ...f, memo: e.target.value }))} />
              </label>
              <button onClick={simulateSend}>Confirmar envio</button>
            </div>
          )}
        </article>

        <article className="card ledger">
          <h3>Atividade recente</h3>
          <ul>
            {wallet.pending_operations.map((op) => (
              <li key={op.id}>
                <span className={setRailBadge(op.rail)}>{op.rail}</span>
                <strong>{op.kind === 'receive' ? '+' : '-'}{sats(op.amount_sats)} sats</strong>
                <small>{op.description}</small>
                <small>{op.time}</small>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {output && (
        <section className="card output">
          <h3>Resultado da operação (simulado)</h3>
          <pre>{output}</pre>
        </section>
      )}
    </main>
  )
}

export default App
