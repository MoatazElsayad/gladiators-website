const rankStyles = {
  1: 'border-l-4 border-[#D4AF37] bg-[linear-gradient(90deg,rgba(212,175,55,0.14),rgba(212,175,55,0.03))]',
  2: 'border-l-4 border-[#C0C0C0] bg-[linear-gradient(90deg,rgba(192,192,192,0.1),rgba(255,255,255,0.03))]',
  3: 'border-l-4 border-[#CD7F32] bg-[linear-gradient(90deg,rgba(205,127,50,0.12),rgba(205,127,50,0.03))]'
}

export default function LeaderboardTable({ rows }) {
  return (
    <div className="panel-card overflow-hidden border-arena-gold/20 bg-[linear-gradient(180deg,rgba(37,24,16,0.98),rgba(25,17,12,0.96))]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-[linear-gradient(180deg,rgba(86,58,31,0.95),rgba(63,42,23,0.95))] text-xs uppercase tracking-[0.18em] text-arena-goldBright">
            <tr>
              <th className="px-4 py-4 sm:px-6">Rank</th>
              <th className="px-4 py-4 sm:px-6">Gladiator</th>
              <th className="px-4 py-4 sm:px-6">Character</th>
              <th className="px-4 py-4 sm:px-6">Score</th>
              <th className="px-4 py-4 sm:px-6">Wins</th>
              <th className="px-4 py-4 sm:px-6">Matches</th>
              <th className="px-4 py-4 sm:px-6">Last Battle</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((fighter) => (
              <tr
                key={`${fighter.username}-${fighter.displayRank || fighter.rank}`}
                className={`border-t border-arena-bronzeLight/20 transition hover:bg-arena-gold/5 ${
                  rankStyles[fighter.displayRank || fighter.rank] || ''
                }`}
              >
                <td className="px-4 py-4 sm:px-6">
                  <span className="status-pill min-w-[3.65rem] justify-center border-arena-gold/35 bg-black/15 text-arena-goldBright">
                    #{fighter.displayRank || fighter.rank}
                  </span>
                </td>
                <td className="px-4 py-4 sm:px-6">
                  <p className="font-semibold text-arena-parchment">{fighter.username}</p>
                  {fighter.title && <p className="mt-1 text-xs uppercase tracking-[0.16em] text-arena-sand/90">{fighter.title}</p>}
                </td>
                <td className="px-4 py-4 text-arena-sand sm:px-6">{fighter.characterName}</td>
                <td className="px-4 py-4 font-semibold text-arena-goldBright sm:px-6">
                  {fighter.score.toLocaleString()}
                </td>
                <td className="px-4 py-4 sm:px-6">{fighter.wins}</td>
                <td className="px-4 py-4 sm:px-6">{fighter.matchesPlayed}</td>
                <td className="px-4 py-4 text-arena-sand sm:px-6">{fighter.lastBattle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
