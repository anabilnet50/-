import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowRight, Share2, MessageCircle, Eye, Tag, Send, Clock, Twitter, Facebook, Linkedin, ChevronLeft, MapPin, TrendingUp, Play, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  const [latestArticles, setLatestArticles] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetch(`/api/articles/${id}`)
      .then(res => res.json())
      .then(data => {
        setArticle(data);
        setLoading(false);
      });

    fetch(`/api/articles/${id}/comments`)
      .then(res => res.json())
      .then(setComments);

    fetch('/api/articles?limit=8')
      .then(res => res.json())
      .then(setLatestArticles);
  }, [id]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || !userName) return;

    fetch(`/api/articles/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: userName, content: comment })
    })
      .then(res => res.json())
      .then(() => {
        setComments([{ name: userName, content: comment, created_at: new Date().toISOString() }, ...comments]);
        setComment('');
        setUserName('');
        alert('تم إضافة تعليقك بنجاح');
      });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribing(true);
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        setIsSubscribing(false);
        if (data.success) {
          alert('تم الاشتراك في النشرة الإخبارية بنجاح');
          setEmail('');
        } else {
          alert(data.error || 'حدث خطأ ما');
        }
      });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = article.title;
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
    }

    if (shareUrl) window.open(shareUrl, '_blank');
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-primary-navy">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary-crimson border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white/20 font-black text-[10px] uppercase tracking-widest">Agras</div>
      </div>
      <p className="mt-8 font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">Loading Excellence...</p>
    </div>
  );

  if (!article) return <div className="text-center py-40 font-black text-2xl text-primary-navy bg-surface-soft min-h-screen flex flex-col items-center gap-8 justify-center">
    <div className="p-10 bg-white rounded-full shadow-premium"><Eye className="w-16 h-16 opacity-10" /></div>
    المحتوى المطلوب غير متوفر حالياً
    <Link to="/" className="text-sm bg-primary-crimson text-white px-8 py-3 rounded-full shadow-glow">العودة للرئيسية</Link>
  </div>;

  const readingTime = Math.ceil(article.content.split(' ').length / 200);

  return (
    <div className="bg-[#fcfdfe] min-h-screen pb-32">
      {/* Cinematic Article Hero */}
      <div className="h-[500px] md:h-[650px] bg-primary-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfdfe] via-primary-navy/40 to-transparent"></div>

        {/* Animated Background Element */}
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-primary-crimson/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-accent-gold/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-[350px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Content Area */}
          <div className="lg:col-span-8 flex flex-col">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Link to="/" className="inline-flex items-center bg-white border border-primary-navy/5 text-primary-navy px-8 py-4 rounded-2xl font-black mb-12 hover:bg-primary-navy hover:text-white transition-all shadow-premium group">
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                العودة للرئيسية
              </Link>
            </motion.div>

            <motion.article
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-50 flex flex-col"
            >
              {/* Premium Media Shell */}
              <div className="relative group overflow-hidden bg-primary-navy">
                {article.video_url ? (
                  <div className="aspect-video w-full bg-black">
                    {article.video_url.includes('youtube.com') || article.video_url.includes('youtu.be') ? (
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${article.video_url.split('v=')[1]?.split('&')[0] || article.video_url.split('/').pop()}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video src={article.video_url || undefined} className="w-full h-full object-contain" controls></video>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={article.image_url || 'https://picsum.photos/seed/editorial/1600/1000'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                {/* Category Badge - Elite Style */}
                <div className="absolute top-8 right-8">
                  <span className="bg-primary-crimson text-white px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-glow border border-white/10 backdrop-blur-md">
                    {article.category_name}
                  </span>
                </div>
              </div>

              <div className="p-10 md:p-20">
                <header className="mb-16">
                  <div className="flex flex-wrap items-center gap-8 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-12 border-b border-gray-50 pb-12">
                    <span className="flex items-center gap-3"><Calendar className="w-4 h-4 text-primary-crimson" /> {new Date(article.created_at).toLocaleDateString('ar-YE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="flex items-center gap-3"><User className="w-4 h-4 text-primary-crimson" /> {article.author || 'هيئة التحرير'}</span>
                    <span className="flex items-center gap-3"><Eye className="w-4 h-4 text-primary-crimson" /> {article.views || 0} قراءة</span>
                    <span className="flex items-center gap-3"><Clock className="w-4 h-4 text-primary-crimson" /> {readingTime} د قراءة</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-primary-navy leading-[1.15] mb-10 drop-shadow-sm">
                    {article.title}
                  </h1>
                  <div className="w-24 h-1.5 bg-primary-crimson rounded-full"></div>
                </header>

                <div className="max-w-4xl mx-auto">
                  <div className="prose prose-2xl max-w-none text-primary-navy/80 leading-[2.2] font-medium text-justify font-serif">
                    {article.content.split('\n').map((p: string, i: number) => (
                      <p key={i} className="mb-10 first-letter:text-5xl first-letter:font-black first-letter:text-primary-crimson first-letter:ml-3 first-letter:float-right">{p}</p>
                    ))}
                  </div>

                  {/* Share Panel - Sophisticated Design */}
                  <div className="mt-20 p-12 glass-card bg-surface-soft/50 rounded-[3rem] border border-primary-navy/5 text-center relative overflow-hidden">
                    <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary-crimson/5 blur-[80px] rounded-full"></div>
                    <h3 className="text-xl font-black text-primary-navy mb-10 flex items-center justify-center gap-4 uppercase tracking-[0.3em] relative z-10">
                      <Share2 className="w-5 h-5 text-primary-crimson" /> ثقافة المشـاركة
                    </h3>
                    <div className="flex justify-center flex-wrap gap-8 relative z-10">
                      {[
                        { icon: Facebook, color: 'bg-[#1877f2]', platform: 'facebook', label: 'Facebook' },
                        { icon: Twitter, color: 'bg-black', platform: 'twitter', label: 'X' },
                        { icon: MessageCircle, color: 'bg-[#25d366]', platform: 'whatsapp', label: 'Whatsapp' }
                      ].map((social, i) => (
                        <button
                          key={i}
                          onClick={() => handleShare(social.platform)}
                          className={`flex items-center gap-4 px-8 py-4 ${social.color} text-white rounded-2xl shadow-xl hover:-translate-y-2 transition-all duration-500 font-bold`}
                        >
                          <social.icon className="w-5 h-5" />
                          <span className="text-xs tracking-widest uppercase">{social.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comments Thread - Elite Conversation */}
                  <div className="mt-24">
                    <h3 className="text-2xl font-black text-primary-navy mb-12 flex items-center gap-6">
                      <div className="p-3 bg-primary-navy text-white rounded-2xl shadow-xl"><MessageCircle className="w-6 h-6" /></div>
                      نـبض الـقارئ
                    </h3>

                    <div className="space-y-12">
                      {/* Comment Form */}
                      <form onSubmit={handleCommentSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-premium border border-gray-50 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <input
                            type="text"
                            value={userName}
                            onChange={e => setUserName(e.target.value)}
                            placeholder="الاسم المستعار"
                            className="w-full p-5 bg-surface-soft border-2 border-transparent focus:border-primary-crimson focus:bg-white transition-all rounded-2xl outline-none font-black text-sm"
                          />
                        </div>
                        <textarea
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          placeholder="ما هو انطباعك حول هذا الخبر؟"
                          rows={4}
                          className="w-full p-6 bg-surface-soft border-2 border-transparent focus:border-primary-crimson focus:bg-white transition-all rounded-2xl outline-none font-bold text-base"
                        ></textarea>
                        <button className="bg-primary-navy text-white py-5 rounded-2xl font-black shadow-2xl shadow-primary-navy/20 hover:bg-primary-crimson transition-all flex items-center justify-center gap-4 group">
                          <Send className="w-5 h-5 group-hover:translate-x-[-10px] transition-transform" /> إرسال التعليق
                        </button>
                      </form>

                      {/* Comments Display */}
                      <div className="space-y-6">
                        {comments.map((c, i) => (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            key={i}
                            className="p-8 bg-white rounded-3xl border border-gray-50 shadow-sm relative group"
                          >
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-full bg-primary-crimson transition-all duration-500 rounded-full"></div>
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary-navy/5 rounded-full flex items-center justify-center font-black text-primary-navy">{c.name?.[0]}</div>
                                <span className="font-black text-primary-navy text-sm uppercase tracking-widest">{c.name}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-3 py-1 bg-gray-50 rounded-full">{new Date(c.created_at).toLocaleDateString('ar-YE')}</span>
                            </div>
                            <p className="text-gray-600 font-bold leading-relaxed text-sm">{c.content}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>

          {/* Sidebar Area - Elite Discovery */}
          <div className="lg:col-span-4 flex flex-col gap-10">

            {/* Trending Sidebar */}
            <div className="glass-card bg-white/40 border border-primary-navy/5 overflow-hidden flex flex-col shadow-2xl rounded-[3rem]">
              <div className="p-8 bg-primary-navy text-white flex items-center justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-crimson/10 skew-x-[-20deg] translate-x-[-30%]"></div>
                <h4 className="font-black text-lg flex items-center gap-4 relative z-10">
                  <TrendingUp className="w-5 h-5 text-accent-gold" /> شـائع الآن
                </h4>
                <div className="w-2.5 h-2.5 bg-primary-crimson rounded-full animate-pulse shadow-glow relative z-10"></div>
              </div>
              <div className="p-8 flex flex-col gap-8 divide-y divide-gray-50">
                {latestArticles.slice(0, 5).map((a, i) => (
                  <Link key={a.id} to={`/article/${a.id}`} className="group pt-8 first:pt-0 flex gap-6 items-start">
                    <div className="flex flex-col gap-2 flex-1">
                      <span className="text-[9px] font-black text-primary-crimson uppercase tracking-[0.3em]">{a.category_name}</span>
                      <p className="text-primary-navy font-black text-base line-clamp-2 leading-[1.4] group-hover:text-primary-crimson transition-colors">{a.title}</p>
                      <div className="flex items-center gap-4 mt-2 opacity-40 text-[9px] font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" /> {a.views || 0}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden shadow-lg border border-white group-hover:scale-105 transition-transform">
                      <img src={a.image_url || `https://picsum.photos/seed/${a.id}/200`} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Dynamic Newsletter - Elite Style */}
            <div className="glass-card p-10 bg-gradient-to-br from-primary-navy to-primary-navy/90 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] group-hover:scale-125 transition-transform duration-1000"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-primary-crimson/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl">
                  <TrendingUp className="w-10 h-10 text-primary-crimson" />
                </div>
                <h3 className="text-white font-black text-2xl mb-4 tracking-tighter">نشرة الصفوة الإخبارية</h3>
                <p className="text-white/40 font-bold text-xs mb-8 uppercase tracking-widest">Premium Weekly Briefing</p>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="عنوان بريدك الإلكتروني"
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-[1.5rem] focus:bg-white focus:text-primary-navy focus:border-white transition-all outline-none font-bold text-white text-sm"
                    required
                  />
                  <button disabled={isSubscribing} className="w-full bg-white text-primary-navy py-5 rounded-[1.5rem] font-black shadow-2xl hover:bg-primary-crimson hover:text-white transition-all active:scale-95 uppercase tracking-widest text-xs">
                    {isSubscribing ? 'Processing...' : 'اشـتراك الآن'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Related Section - Visual Grid */}
        <div className="mt-24 pt-24 border-t border-gray-100/50">
          <h3 className="text-3xl font-black text-primary-navy mb-16 flex items-center gap-6">
            <div className="w-2.5 h-10 bg-primary-crimson rounded-full"></div>
            تحليلات ولقـاءات ذات صـلة
            <div className="flex-1 h-px bg-gray-100 ml-6"></div>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {latestArticles.filter(a => a.id !== Number(id)).slice(0, 4).map((a, i) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -15 }}
                key={a.id}
              >
                <Link to={`/article/${a.id}`} className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-50 shadow-premium block flex flex-col h-full">
                  <div className="h-56 overflow-hidden relative">
                    <img src={a.image_url || `https://picsum.photos/seed/editorial${a.id}/600/400`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-primary-navy/20 group-hover:bg-transparent transition-colors"></div>
                    <div className="absolute top-6 right-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black text-primary-navy uppercase tracking-widest border border-white shadow-lg">
                      {a.category_name}
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <p className="text-xl font-black text-primary-navy group-hover:text-primary-crimson premium-transition line-clamp-2 leading-tight mb-6 flex-1">{a.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-6 border-t border-gray-50">
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary-crimson/50" /> {new Date(a.created_at).toLocaleDateString('ar-YE')}</span>
                      <span className="flex items-center gap-2 group-hover:text-primary-crimson transition-colors">التفاصيل <ArrowLeft className="w-3.5 h-3.5" /></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
