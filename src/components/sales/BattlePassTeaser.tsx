import { Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { AegisEmblem } from "@/components/site/AegisEmblem";
import { Icon } from "@/components/site/Icons";
import { BATTLE_PASS, HIGHEST_GOAL_REACHED } from "@/content/battlePass";
import { useMemberCounts } from "@/lib/memberCounts";

/**
 * Slim band after Pricing pointing to the Battle Pass page: the level track in miniature,
 * ending on the Aegis. A bonus next to the offer, without pulling focus from the button.
 */
export function BattlePassTeaser() {
  const { members } = useMemberCounts();
  const reached = Math.max(members, HIGHEST_GOAL_REACHED);

  return (
    <section className="pb-20 sm:pb-24">
      <Container>
        <Reveal>
          <Link
            to="/battle-pass"
            className="group relative flex flex-col items-center gap-6 overflow-hidden rounded-card border border-gold/40 bg-[linear-gradient(100deg,rgba(232,181,74,0.12),rgba(232,181,74,0.02)_60%)] p-6 text-center transition hover:border-gold sm:p-8 md:flex-row md:text-left"
          >
            <AegisEmblem className="h-28 w-28 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">6SLOT Battle Pass</p>
              <p className="mt-2 text-xl font-extrabold text-text sm:text-2xl">Every new member unlocks rewards for everyone.</p>
              <p className="mt-1.5 text-sm text-text-muted">
                4 levels of giveaways as the community grows, all the way to a real Aegis replica at 100 members.
              </p>
              {/* Mini track */}
              <ol aria-label="Battle Pass levels" className="mt-5 flex items-center">
                {BATTLE_PASS.map((l, i) => {
                  const on = reached >= l.goal;
                  return (
                    <li key={l.goal} className={`flex items-center ${i ? "flex-1" : ""}`}>
                      {i > 0 && <span aria-hidden className={`h-0.5 flex-1 ${on ? "bg-gold" : "bg-navy-border"}`} />}
                      <span
                        className={`flex h-8 min-w-8 items-center justify-center rounded-full border px-1.5 text-[10px] font-black ${
                          on ? "border-gold bg-gold text-navy" : "border-navy-border bg-navy text-text-muted"
                        } ${i === BATTLE_PASS.length - 1 ? "border-gold/70 text-gold" : ""}`}
                      >
                        {l.goal >= 1000 ? `${l.goal / 1000}K` : l.goal}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <span className="flex shrink-0 items-center gap-2 text-sm font-bold text-gold">
              See the rewards
              <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
