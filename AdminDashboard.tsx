import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, LayoutDashboard, FileText, Settings, LogOut, Eye, TrendingUp, AlertCircle, Search, Filter, MessageCircle, User, Globe, ExternalLink } from 'lucide-react';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'news' | 'categories' | 'comments' | 'subscribers' | 'settings'>('dashboard');
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState<any>({
    chief_editor: 'صلاح حيدرة',
    wisdom_right: '',
    wisdom_left: '',
    site_name: 'أجراس اليمن',
    contact_email: '',
    youtube_url: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    ad_title: 'مساحة إعلانية',
    ad_text: 'بـ 1000 .. لف الدنيا لف',
    ad_subtext: '300 دقيقة مكالمات ، 200 رسالة ، 100 SMS',
    ad_image: 'https://picsum.photos/seed/ad/400/600',
    rights_title: 'حقوق وحريات',
    rights_bg: 'https://picsum.photos/seed/unicef-rights/600/800',
    tech_title: 'تـكنولوجيا',
    tech_bg: 'https://picsum.photos/seed/future-tech/600/800',
    economy_title: 'اقتصاد',
    economy_bg: 'https://picsum.photos/seed/economy-gold/600/400',
    tourism_title: 'سياحة',
    tourism_bg: 'https://picsum.photos/seed/tourism-yemen/600/400',
    sports_title: 'رياضة',
    sports_bg: 'https://picsum.photos/seed/sports-action/600/400',
  });
  const [currentArticle, setCurrentArticle] = useState<any>({
    title: '',
    content: '',
    category_id: 1,
    image_url: '',
    video_url: '',
    is_urgent: false,
    tags: ''
  });
  const [currentCategory, setCurrentCategory] = useState<any>({
    name: '',
    slug: ''
  });

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    fetchComments();
    fetchSubscribers();
    fetchStats();
    fetchSettings();
  }, []);

  const fetchComments = () => {
    fetch('/api/comments')
      .then(res => res.json())
      .then(setComments);
  };

  const fetchSubscribers = () => {
    fetch('/api/subscribers')
      .then(res => res.json())
      .then(setSubscribers);
  };

  const fetchArticles = () => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(setArticles);
  };

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories);
  };

  const fetchStats = () => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(setStats);
  };

  const fetchSettings = () => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      });
  };

  const handleLogout = () => {
    if (confirm('هل تريد تسجيل الخروج؟')) {
      window.location.href = '/';
    }
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).then(() => {
      alert('تم حفظ الإعدادات بنجاح');
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = currentArticle.id ? 'PUT' : 'POST';
    const url = currentArticle.id ? `/api/articles/${currentArticle.id}` : '/api/articles';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentArticle)
    }).then(() => {
      setIsEditing(false);
      setCurrentArticle({ title: '', content: '', category_id: 1, image_url: '', is_urgent: false, tags: '' });
      fetchArticles();
      fetchStats();
    });
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = currentCategory.id ? 'PUT' : 'POST';
    const url = currentCategory.id ? `/api/categories/${currentCategory.id}` : '/api/categories';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentCategory)
    }).then(res => res.json()).then(data => {
      if (data.error) alert(data.error);
      else {
        setIsEditingCategory(false);
        setCurrentCategory({ name: '', slug: '' });
        fetchCategories();
      }
    });
  };

  const handleCategoryDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      fetch(`/api/categories/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          if (data.success) fetchCategories();
          else alert(data.error);
        });
    }
  };

  const handleCommentDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
      fetch(`/api/comments/${id}`, { method: 'DELETE' })
        .then(() => fetchComments());
    }
  };

  const handleSubscriberDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المشترك؟')) {
      fetch(`/api/subscribers/${id}`, { method: 'DELETE' })
        .then(() => fetchSubscribers());
    }
  };

  const handleImageUpload = (file: File, target: string) => {
    const formData = new FormData();
    formData.append('image', file);

    fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (target === 'article') {
          setCurrentArticle(prev => ({ ...prev, image_url: data.imageUrl }));
        } else {
          setSettings(prev => ({ ...prev, [target]: data.imageUrl }));
        }
      });
  };

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-surface-soft min-h-screen pb-32 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 bg-primary-navy text-white hidden lg:flex flex-col shadow-2xl">
        <div className="p-8 text-3xl font-black border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-crimson rounded-lg flex items-center justify-center">أ</div>
          أجراس اليمن
        </div>
        <nav className="flex-1 p-6 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">القائمة الرئيسية</p>
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`flex items-center gap-4 w-full p-4 rounded-xl font-bold border transition-all ${activeSection === 'dashboard' ? 'bg-primary-crimson/10 text-primary-crimson border-primary-crimson/20' : 'hover:bg-white/5 text-gray-400 hover:text-white border-transparent'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> لوحة التحكم
          </button>
          <button
            onClick={() => setActiveSection('news')}
            className={`flex items-center gap-4 w-full p-4 rounded-xl font-bold border transition-all ${activeSection === 'news' ? 'bg-primary-crimson/10 text-primary-crimson border-primary-crimson/20' : 'hover:bg-white/5 text-gray-400 hover:text-white border-transparent'}`}
          >
            <FileText className="w-5 h-5" /> إدارة الأخبار
          </button>
          <button
            onClick={() => setActiveSection('categories')}
            className={`flex items-center gap-4 w-full p-4 rounded-xl font-bold border transition-all ${activeSection === 'categories' ? 'bg-primary-crimson/10 text-primary-crimson border-primary-crimson/20' : 'hover:bg-white/5 text-gray-400 hover:text-white border-transparent'}`}
          >
            <Filter className="w-5 h-5" /> إدارة الأقسام
          </button>
          <button
            onClick={() => setActiveSection('comments')}
            className={`flex items-center gap-4 w-full p-4 rounded-xl font-bold border transition-all ${activeSection === 'comments' ? 'bg-primary-crimson/10 text-primary-crimson border-primary-crimson/20' : 'hover:bg-white/5 text-gray-400 hover:text-white border-transparent'}`}
          >
            <MessageCircle className="w-5 h-5" /> التعليقات
          </button>
          <button
            onClick={() => setActiveSection('subscribers')}
            className={`flex items-center gap-4 w-full p-4 rounded-xl font-bold border transition-all ${activeSection === 'subscribers' ? 'bg-primary-crimson/10 text-primary-crimson border-primary-crimson/20' : 'hover:bg-white/5 text-gray-400 hover:text-white border-transparent'}`}
          >
            <User className="w-5 h-5" /> المشتركون
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`flex items-center gap-4 w-full p-4 rounded-xl font-bold border transition-all ${activeSection === 'settings' ? 'bg-primary-crimson/10 text-primary-crimson border-primary-crimson/20' : 'hover:bg-white/5 text-gray-400 hover:text-white border-transparent'}`}
          >
            <Settings className="w-5 h-5" /> إعدادات الموقع
          </button>

          <div className="pt-4 mt-4 border-t border-white/5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 w-full p-4 rounded-xl font-bold border border-white/10 hover:bg-primary-crimson hover:text-white transition-all text-gray-400"
            >
              <ExternalLink className="w-5 h-5" /> معاينة الموقع
            </a>
          </div>
        </nav>
        <div className="p-6 border-t border-white/5">
          <div className="bg-white/5 p-4 rounded-xl mb-4">
            <p className="text-xs text-gray-400 mb-1">المستخدم الحالي</p>
            <p className="font-bold">{settings.chief_editor || 'صلاح حيدرة'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full p-4 text-primary-crimson/80 hover:bg-primary-crimson/10 rounded-xl font-bold transition-all"
          >
            <LogOut className="w-5 h-5" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        {activeSection === 'dashboard' && (
          <div className="space-y-10">
            <h1 className="text-3xl font-black text-gray-900">نظرة عامة</h1>
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><FileText className="w-7 h-7" /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold">إجمالي الأخبار</p>
                    <p className="text-2xl font-black">{stats.totalArticles}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><Eye className="w-7 h-7" /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold">إجمالي المشاهدات</p>
                    <p className="text-2xl font-black">{stats.totalViews}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                  <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><MessageCircle className="w-7 h-7" /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold">التعليقات</p>
                    <p className="text-2xl font-black">{stats.totalComments}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><User className="w-7 h-7" /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold">المشتركون</p>
                    <p className="text-2xl font-black">{stats.totalSubscribers}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-black mb-6">توزيع الأخبار حسب التصنيف</h3>
                <div className="space-y-4">
                  {stats?.categoryStats.map((cat: any) => (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span>{cat.name}</span>
                        <span>{cat.count} خبر</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-red-600 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${(cat.count / stats.totalArticles) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-black mb-6">آخر الأخبار المضافة</h3>
                <div className="space-y-4">
                  {articles.slice(0, 5).map(article => (
                    <div key={article.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img src={article.image_url || undefined} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{article.title}</p>
                        <p className="text-xs text-gray-500">{new Date(article.created_at).toLocaleDateString('ar-YE')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'news' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900">إدارة الأخبار</h1>
                <p className="text-gray-500 font-medium">تحكم في جميع أخبار ومقالات الموقع من هنا</p>
              </div>
              <button
                onClick={() => { setIsEditing(true); setCurrentArticle({ title: '', content: '', category_id: 1, image_url: '', is_urgent: false, tags: '' }); }}
                className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-xl shadow-primary-crimson/20 hover:bg-primary-crimson/80 transition-all transform hover:-translate-y-1"
              >
                <Plus className="w-6 h-6" /> إضافة خبر جديد
              </button>
            </div>

            {isEditing ? (
              <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-10 border-b pb-6">
                  <h2 className="text-2xl font-black text-gray-900">{currentArticle.id ? 'تعديل الخبر' : 'إنشاء خبر جديد'}</h2>
                  <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 font-bold">إغلاق</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">عنوان الخبر</label>
                      <input
                        type="text"
                        value={currentArticle.title}
                        onChange={e => setCurrentArticle({ ...currentArticle, title: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                        placeholder="أدخل عنواناً جذاباً للخبر..."
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">التصنيف</label>
                      <select
                        value={currentArticle.category_id}
                        onChange={e => setCurrentArticle({ ...currentArticle, category_id: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold appearance-none"
                      >
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">رابط الصورة</label>
                      <input
                        type="text"
                        value={currentArticle.image_url}
                        onChange={e => setCurrentArticle({ ...currentArticle, image_url: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">أو رفع من الجهاز</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'article')}
                        className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">الوسوم (Tags)</label>
                      <input
                        type="text"
                        value={currentArticle.tags || ''}
                        onChange={e => setCurrentArticle({ ...currentArticle, tags: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                        placeholder="يمن، اقتصاد، عاجل..."
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">رابط الفيديو (اختياري)</label>
                      <input
                        type="text"
                        value={currentArticle.video_url || ''}
                        onChange={e => setCurrentArticle({ ...currentArticle, video_url: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                        placeholder="رابط يوتيوب أو فيديو مباشر..."
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700">محتوى الخبر التفصيلي</label>
                    <textarea
                      rows={12}
                      value={currentArticle.content}
                      onChange={e => setCurrentArticle({ ...currentArticle, content: e.target.value })}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold leading-relaxed"
                      placeholder="اكتب تفاصيل الخبر هنا..."
                      required
                    ></textarea>
                  </div>
                  <div className="flex items-center gap-4 bg-red-50 p-4 rounded-2xl border border-red-100">
                    <input
                      type="checkbox"
                      id="urgent"
                      checked={currentArticle.is_urgent}
                      onChange={e => setCurrentArticle({ ...currentArticle, is_urgent: e.target.checked })}
                      className="w-6 h-6 accent-red-600 cursor-pointer"
                    />
                    <label htmlFor="urgent" className="font-black text-red-700 cursor-pointer">تمييز كخبر عاجل (سيظهر في شريط الأخبار)</label>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="submit" className="bg-red-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-primary-crimson/20 hover:bg-primary-crimson/80 transition-all">حفظ ونشر الخبر</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-100 text-gray-600 px-12 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all">إلغاء</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-6 border-b flex flex-col md:flex-row justify-between gap-4 bg-gray-50/50">
                  <div className="relative flex-1">
                    <Search className="absolute right-4 top-3.5 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="ابحث عن خبر بالاسم أو التصنيف..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pr-12 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-gray-50/50 border-b">
                      <tr>
                        <th className="p-6 font-black text-gray-600">الخبر</th>
                        <th className="p-6 font-black text-gray-600">التصنيف</th>
                        <th className="p-6 font-black text-gray-600">المشاهدات</th>
                        <th className="p-6 font-black text-gray-600">التاريخ</th>
                        <th className="p-6 font-black text-gray-600 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredArticles.map(article => (
                        <tr key={article.id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                <img src={article.image_url || undefined} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div className="max-w-xs xl:max-w-md">
                                <p className="font-black text-gray-900 truncate group-hover:text-primary-crimson transition-colors">{article.title}</p>
                                {article.is_urgent === 1 && <span className="text-[10px] bg-red-100 text-primary-crimson px-2 py-0.5 rounded-full font-black uppercase">عاجل</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-6"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black">{article.category_name}</span></td>
                          <td className="p-6">
                            <div className="flex items-center gap-2 font-bold text-gray-600">
                              <Eye className="w-4 h-4" /> {article.views || 0}
                            </div>
                          </td>
                          <td className="p-6 text-sm text-gray-500 font-bold">{new Date(article.created_at).toLocaleDateString('ar-YE')}</td>
                          <td className="p-6">
                            <div className="flex justify-center gap-3">
                              <button onClick={() => { setCurrentArticle(article); setIsEditing(true); }} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                              <button
                                onClick={() => {
                                  if (window.confirm('هل أنت متأكد من حذف هذا الخبر نهائياً؟')) {
                                    fetch(`/api/articles/${article.id}`, { method: 'DELETE' })
                                      .then(() => {
                                        fetchArticles();
                                        fetchStats();
                                      });
                                  }
                                }}
                                className="p-3 text-primary-crimson hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'categories' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-black text-gray-900">إدارة الأقسام</h1>
              <button
                onClick={() => { setIsEditingCategory(true); setCurrentCategory({ name: '', slug: '' }); }}
                className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary-crimson/20 hover:bg-primary-crimson/80 transition-all"
              >
                <Plus className="w-6 h-6" /> إضافة قسم جديد
              </button>
            </div>

            {isEditingCategory ? (
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <form onSubmit={handleCategorySubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">اسم القسم</label>
                      <input
                        type="text"
                        value={currentCategory.name}
                        onChange={e => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">الرابط اللطيف (Slug)</label>
                      <input
                        type="text"
                        value={currentCategory.slug}
                        onChange={e => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                        placeholder="e.g., local-news"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="submit" className="bg-red-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-primary-crimson/20 hover:bg-primary-crimson/80 transition-all">حفظ القسم</button>
                    <button type="button" onClick={() => setIsEditingCategory(false)} className="bg-gray-100 text-gray-600 px-12 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all">إلغاء</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <table className="w-full text-right">
                  <thead className="bg-gray-50/50 border-b">
                    <tr>
                      <th className="p-6 font-black text-gray-600">الاسم</th>
                      <th className="p-6 font-black text-gray-600">الرابط (Slug)</th>
                      <th className="p-6 font-black text-gray-600 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map(cat => (
                      <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-6 font-bold">{cat.name}</td>
                        <td className="p-6 font-mono text-sm text-gray-500">{cat.slug}</td>
                        <td className="p-6">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => { setCurrentCategory(cat); setIsEditingCategory(true); }} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                            <button onClick={() => handleCategoryDelete(cat.id)} className="p-3 text-primary-crimson hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSection === 'comments' && (
          <div className="space-y-10">
            <h1 className="text-3xl font-black text-gray-900">إدارة التعليقات</h1>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <table className="w-full text-right">
                <thead className="bg-gray-50/50 border-b">
                  <tr>
                    <th className="p-6 font-black text-gray-600">المعلق</th>
                    <th className="p-6 font-black text-gray-600">التعليق</th>
                    <th className="p-6 font-black text-gray-600">الخبر</th>
                    <th className="p-6 font-black text-gray-600 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {comments.map(comment => (
                    <tr key={comment.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-6 font-bold">{comment.name}</td>
                      <td className="p-6 text-sm text-gray-600 leading-relaxed">{comment.content}</td>
                      <td className="p-6 font-bold text-blue-600">{comment.article_title}</td>
                      <td className="p-6">
                        <div className="flex justify-center">
                          <button onClick={() => handleCommentDelete(comment.id)} className="p-3 text-primary-crimson hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'subscribers' && (
          <div className="space-y-10">
            <h1 className="text-3xl font-black text-gray-900">المشتركون في النشرة</h1>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <table className="w-full text-right">
                <thead className="bg-gray-50/50 border-b">
                  <tr>
                    <th className="p-6 font-black text-gray-600">البريد الإلكتروني</th>
                    <th className="p-6 font-black text-gray-600">تاريخ الاشتراك</th>
                    <th className="p-6 font-black text-gray-600 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscribers.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-6 font-bold">{sub.email}</td>
                      <td className="p-6 text-gray-500 font-bold text-sm">{new Date(sub.created_at).toLocaleDateString('ar-YE')}</td>
                      <td className="p-6">
                        <div className="flex justify-center">
                          <button onClick={() => handleSubscriberDelete(sub.id)} className="p-3 text-primary-crimson hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="space-y-10 max-w-4xl">
            <div>
              <h1 className="text-3xl font-black text-gray-900">إعدادات الموقع</h1>
              <p className="text-gray-500 font-medium">تخصيص المعلومات الأساسية والنصوص الثابتة في الموقع</p>
            </div>

            <form onSubmit={handleSettingsSubmit} className="bg-white p-8 lg:p-12 rounded-3xl shadow-xl border border-gray-100 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-black text-gray-700">اسم الموقع</label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={e => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-black text-gray-700">رئيس التحرير</label>
                  <input
                    type="text"
                    value={settings.chief_editor}
                    onChange={e => setSettings(prev => ({ ...prev, chief_editor: e.target.value }))}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700">حكمة اليوم (يمين)</label>
                <textarea
                  rows={3}
                  value={settings.wisdom_right}
                  onChange={e => setSettings(prev => ({ ...prev, wisdom_right: e.target.value }))}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                ></textarea>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700">قول مأثور (يسار)</label>
                <textarea
                  rows={3}
                  value={settings.wisdom_left}
                  onChange={e => setSettings(prev => ({ ...prev, wisdom_left: e.target.value }))}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-black text-gray-700">بريد التواصل</label>
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={e => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-black text-gray-700">رابط قناة اليوتيوب</label>
                  <input
                    type="text"
                    value={settings.youtube_url}
                    onChange={e => setSettings(prev => ({ ...prev, youtube_url: e.target.value }))}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-black text-gray-700">رابط فيسبوك</label>
                  <input
                    type="text"
                    value={settings.facebook_url}
                    onChange={e => setSettings(prev => ({ ...prev, facebook_url: e.target.value }))}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-black text-gray-700">رابط تويتر</label>
                  <input
                    type="text"
                    value={settings.twitter_url}
                    onChange={e => setSettings(prev => ({ ...prev, twitter_url: e.target.value }))}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-black text-gray-700">رابط لينكد إن</label>
                  <input
                    type="text"
                    value={settings.linkedin_url}
                    onChange={e => setSettings(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                  />
                </div>
              </div>

              <div className="border-t pt-8">
                <h3 className="text-xl font-black mb-6 text-primary-crimson">إدارة المساحة الإعلانية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700">عنوان الإعلان</label>
                    <input
                      type="text"
                      value={settings.ad_title}
                      onChange={e => setSettings(prev => ({ ...prev, ad_title: e.target.value }))}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700">نص الإعلان الرئيسي</label>
                    <input
                      type="text"
                      value={settings.ad_text}
                      onChange={e => setSettings(prev => ({ ...prev, ad_text: e.target.value }))}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700">النص الفرعي</label>
                    <input
                      type="text"
                      value={settings.ad_subtext}
                      onChange={e => setSettings(prev => ({ ...prev, ad_subtext: e.target.value }))}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700">رابط صورة الإعلان</label>
                    <input
                      type="text"
                      value={settings.ad_image}
                      onChange={e => setSettings(prev => ({ ...prev, ad_image: e.target.value }))}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700">أو رفع من الجهاز</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'ad_image')}
                      className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Category Sections */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-black mb-6 text-primary-crimson">واجهة الأقسام الديناميكية</h3>

                {/* Rights Section */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-6">
                  <h4 className="font-black text-gray-900 mb-4">قسم حقوق وحريات</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">عنوان القسم</label>
                      <input type="text" value={settings.rights_title} onChange={e => setSettings(prev => ({ ...prev, rights_title: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">رابط صورة الخلفية</label>
                      <input type="text" value={settings.rights_bg} onChange={e => setSettings(prev => ({ ...prev, rights_bg: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="block text-sm font-black text-gray-700">أو رفع من الجهاز</label>
                      <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'rights_bg')} className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                  </div>
                </div>

                {/* Tech Section */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-6">
                  <h4 className="font-black text-gray-900 mb-4">قسم تكنولوجيا</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">عنوان القسم</label>
                      <input type="text" value={settings.tech_title} onChange={e => setSettings(prev => ({ ...prev, tech_title: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">رابط صورة الخلفية</label>
                      <input type="text" value={settings.tech_bg} onChange={e => setSettings(prev => ({ ...prev, tech_bg: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="block text-sm font-black text-gray-700">أو رفع من الجهاز</label>
                      <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'tech_bg')} className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                  </div>
                </div>

                {/* Economy Section */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-6">
                  <h4 className="font-black text-gray-900 mb-4">قسم اقتصاد</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">عنوان القسم</label>
                      <input type="text" value={settings.economy_title} onChange={e => setSettings(prev => ({ ...prev, economy_title: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">رابط صورة الخلفية</label>
                      <input type="text" value={settings.economy_bg} onChange={e => setSettings(prev => ({ ...prev, economy_bg: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="block text-sm font-black text-gray-700">أو رفع من الجهاز</label>
                      <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'economy_bg')} className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                  </div>
                </div>

                {/* Tourism Section */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-6">
                  <h4 className="font-black text-gray-900 mb-4">قسم سياحة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">عنوان القسم</label>
                      <input type="text" value={settings.tourism_title} onChange={e => setSettings(prev => ({ ...prev, tourism_title: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">رابط صورة الخلفية</label>
                      <input type="text" value={settings.tourism_bg} onChange={e => setSettings(prev => ({ ...prev, tourism_bg: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="block text-sm font-black text-gray-700">أو رفع من الجهاز</label>
                      <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'tourism_bg')} className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                  </div>
                </div>

                {/* Sports Section */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-6">
                  <h4 className="font-black text-gray-900 mb-4">قسم رياضة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">عنوان القسم</label>
                      <input type="text" value={settings.sports_title} onChange={e => setSettings(prev => ({ ...prev, sports_title: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-700">رابط صورة الخلفية</label>
                      <input type="text" value={settings.sports_bg} onChange={e => setSettings(prev => ({ ...prev, sports_bg: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="block text-sm font-black text-gray-700">أو رفع من الجهاز</label>
                      <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'sports_bg')} className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:border-red-500 transition-all font-bold" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center gap-4">
                <button type="submit" className="bg-red-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-primary-crimson/20 hover:bg-primary-crimson/80 transition-all">حفظ التغييرات</button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من إلغاء كافة التعديلات غير المحفوظة؟')) {
                      fetchSettings();
                    }
                  }}
                  className="bg-gray-100 text-gray-500 px-12 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )
        }
      </main >
    </div >
  );
}
