import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, Flame, GraduationCap, Globe, Lock, Settings, ArrowLeft } from "lucide-react";
import { useAuth } from "../lib/hooks/useAuth";
import { fetchOwnProfile, fetchPublicProfile, fetchPublicTextsByAuthor, UserProfileData, PublicText } from "../lib/services/profileService";
import { cn } from "@/lib/utils";

function formatDate(val: any): string {
  if (!val) return "";
  const d = val?.toDate ? val.toDate() : new Date(val);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

export const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOwnProfile = user?.uid === userId;

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [texts, setTexts] = useState<PublicText[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      setIsPrivate(false);
      try {
        let data: UserProfileData | null = null;
        if (isOwnProfile) {
          data = await fetchOwnProfile(userId);
        } else {
          data = await fetchPublicProfile(userId);
        }

        if (!data) {
          setIsPrivate(true);
          setLoading(false);
          return;
        }

        setProfile(data);

        if (data.isPublic || isOwnProfile) {
          try {
            const publicTexts = await fetchPublicTextsByAuthor(userId);
            setTexts(publicTexts);
          } catch {
            // non-fatal
          }
        }
      } catch {
        setIsPrivate(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, isOwnProfile]);

  const initials = (profile?.displayName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-screen">
        <div className="card px-6 py-4 text-sm font-medium text-ink2">Loading profile…</div>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="p-6 md:p-12 max-w-2xl mx-auto font-sans min-h-screen flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-parch2 border border-bdr flex items-center justify-center">
          <Lock className="w-7 h-7 text-muted" />
        </div>
        <div>
          <h2 className="text-[22px] font-serif text-ink mb-2">Profile is private</h2>
          <p className="text-[14px] text-muted">
            This scholar has not made their profile public yet.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary flex items-center gap-2 px-5 py-2.5"
        >
          <ArrowLeft className="w-4 h-4" /> Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto font-sans min-h-screen pb-24">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[13px] text-muted hover:text-ink transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* ── Profile header ─────────────────────────────────────────────── */}
      <div className="card p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-blue/10 border-2 border-blue/20 flex items-center justify-center overflow-hidden shrink-0">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-blue">{initials}</span>
            )}
          </div>

          {/* Name + handle + bio */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-[24px] font-serif font-semibold text-ink leading-tight">
                {profile?.displayName || "Scholar"}
              </h1>
              {!profile?.isPublic && isOwnProfile && (
                <span className="px-2 py-0.5 rounded-full bg-parch2 border border-bdr text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Private
                </span>
              )}
              {profile?.isPublic && (
                <span className="px-2 py-0.5 rounded-full bg-blue/5 border border-blue/15 text-[10px] font-bold text-blue uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" /> Public
                </span>
              )}
            </div>

            {profile?.nickname && (
              <p className="text-[14px] font-mono text-muted mb-2">@{profile.nickname}</p>
            )}

            {profile?.bio && (
              <p className="text-[14px] text-ink2 leading-relaxed mb-3 max-w-md">{profile.bio}</p>
            )}

            {profile?.createdAt && (
              <p className="text-[11px] text-muted">Scholar since {formatDate(profile.createdAt)}</p>
            )}
          </div>

          {/* Own profile: edit button */}
          {isOwnProfile && (
            <button
              onClick={() => navigate("/app/settings")}
              className="btn-secondary flex items-center gap-2 px-4 py-2 text-[13px] shrink-0"
            >
              <Settings className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        {profile?.stats && (
          <div className="mt-6 pt-6 border-t border-bdr grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 rounded-xl bg-parch2/60">
              <div className="flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-4 h-4 text-blue" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Known words</span>
              </div>
              <span className="text-[22px] font-serif font-semibold text-ink">
                {profile.stats.totalKnown.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-parch2/60">
              <div className="flex items-center gap-1.5 mb-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Day streak</span>
              </div>
              <span className="text-[22px] font-serif font-semibold text-ink">{profile.stats.streak}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-parch2/60 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen className="w-4 h-4 text-blue" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Shared texts</span>
              </div>
              <span className="text-[22px] font-serif font-semibold text-ink">{texts.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Shared texts ───────────────────────────────────────────────── */}
      {texts.length > 0 && (
        <section className="card p-8">
          <h2 className="font-serif text-[18px] text-ink mb-5 pb-4 border-b border-bdr">
            Shared Texts
          </h2>
          <div className="space-y-3">
            {texts.map((text) => (
              <button
                key={text.id}
                onClick={() => navigate(`/app/reader/${text.id}`)}
                className="w-full flex items-start gap-4 p-4 rounded-xl hover:bg-parch2/70 border border-transparent hover:border-bdr transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4 text-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-ink group-hover:text-blue transition-colors truncate mb-0.5">
                    {text.title}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-md font-mono bg-parch2 border border-bdr/50 text-[10px] uppercase tracking-wider"
                    )}>
                      {text.languageId}
                    </span>
                    {text.stats?.totalWords && (
                      <span>{text.stats.totalWords.toLocaleString()} words</span>
                    )}
                    {text.createdAt && (
                      <span>{formatDate(text.createdAt)}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {texts.length === 0 && (profile?.isPublic || isOwnProfile) && (
        <div className="card p-8 text-center">
          <BookOpen className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-[14px] text-muted">
            {isOwnProfile
              ? "You haven't shared any texts yet. Import a text and set it to public to share with the community."
              : "This scholar hasn't shared any public texts yet."}
          </p>
          {isOwnProfile && (
            <button
              onClick={() => navigate("/app/import")}
              className="mt-4 btn-secondary px-5 py-2.5 text-[13px]"
            >
              Import a text
            </button>
          )}
        </div>
      )}
    </div>
  );
};
