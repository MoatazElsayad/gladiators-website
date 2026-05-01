const rankStyles = {
  1: 'border-l-4 border-[#D4AF37] bg-[#D4AF37]/10',
  2: 'border-l-4 border-[#C0C0C0] bg-white/5',
  3: 'border-l-4 border-[#CD7F32] bg-[#CD7F32]/10'
}

export default function LeaderboardTable({ rows }) {
  return (
    <div className="panel-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-arena-stone/85 text-xs uppercase tracking-[0.18em] text-arena-gold">
            <tr>
              <th className="px-4 py-4 sm:px-6">Rank</th>
              <th className="px-4 py-4 sm:px-6">Gladiator</th>
              <th className="px-4 py-4 sm:px-6">Title</th>
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
                  <span className="status-pill border-arena-gold/35 text-arena-goldBright">
                    #{fighter.displayRank || fighter.rank}
                  </span>
                </td>
                <td className="px-4 py-4 sm:px-6">
                  <p className="font-semibold text-arena-parchment">{fighter.username}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-arena-sand">Arena contender</p>
                </td>
                <td className="px-4 py-4 sm:px-6">
                  <div className="flex min-w-[170px] items-center gap-3">
                    <img
                      src={fighter.rankBadge}
                      alt={`${fighter.title} rank badge`}
                      className="h-12 w-12 shrink-0 rounded-full object-contain drop-shadow-[0_0_12px_rgba(212,160,23,0.32)]"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-arena-goldBright">{fighter.title}</p>
                      <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-arena-sand">
                        Rank Title
                      </p>
                    </div>
                  </div>
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
