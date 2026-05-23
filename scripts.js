/* Google Analytics (GA4) 設定 */
(function() {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-X85EKK3RK7';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-X85EKK3RK7');
})();

document.addEventListener("DOMContentLoaded", function() {

    // サイトのデフォルト配色を定義
    const DEFAULT_COLORS = {
        main: '#8B2C3A',
        sub: '#1A234B'
    };

    const root = document.documentElement;
    const basePath = document.body.dataset.basePath;

    // --- ユーティリティ関数群 ---

    /**
     * 指定された16進数カラーコードを暗くする
     */
    function darkenColor(hex, percent) {
        if (!hex || !hex.startsWith('#')) return '#000000';
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        r = Math.floor(r * (100 - percent) / 100);
        g = Math.floor(g * (100 - percent) / 100);
        b = Math.floor(b * (100 - percent) / 100);
        const toHex = c => ('0' + Math.max(0, c).toString(16)).slice(-2);
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    /**
     * 背景色から適切な文字色（白/黒）を決定する
     */
    function getTextColorForBackground(hexcolor) {
        if (!hexcolor || !hexcolor.startsWith('#')) return '#1f2937';
        const r = parseInt(hexcolor.substring(1, 3), 16);
        const g = parseInt(hexcolor.substring(3, 5), 16);
        const b = parseInt(hexcolor.substring(5, 7), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#1f2937' : '#ffffff';
    }

    /**
     * 通常の文字色から少し薄い文字色を生成する
     */
    function getMutedTextColor(textColor) {
        return (textColor === '#ffffff') ? '#e5e7eb' : '#374151';
    }

    /**
     * 色の輝度を計算する
     */
    function getLuminance(hexcolor) {
        if (!hexcolor || !hexcolor.startsWith('#')) return 0;
        const r = parseInt(hexcolor.substring(1, 3), 16);
        const g = parseInt(hexcolor.substring(3, 5), 16);
        const b = parseInt(hexcolor.substring(5, 7), 16);
        return ((r * 299) + (g * 587) + (b * 114)) / 1000;
    }

    /**
     * コンテナ内のリンクパスにbasePathを付与して調整する
     */
    function updateLinkPaths(container, basePath) {
        if (!basePath) return;
        const links = container.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('/')) {
                link.setAttribute('href', basePath + href);
            }
        });
    }

    // --- メイン処理関数群 ---

    /**
     * ヘッダーとフッターを読み込み、イベントリスナーを設定する
     */
    function loadCommonComponents() {
        fetch(basePath + 'header.html')
            .then(response => response.text())
            .then(data => {
                const headerPlaceholder = document.getElementById('header-placeholder');
                headerPlaceholder.innerHTML = data;
                updateLinkPaths(headerPlaceholder, basePath);
                const mainColor = getComputedStyle(root).getPropertyValue('--main-color').trim();
                const subColor = getComputedStyle(root).getPropertyValue('--sub-color').trim();
                updateLogos(mainColor, subColor);
                const resetButton = document.getElementById('color-reset-button');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        localStorage.removeItem('reone-main-color');
                        localStorage.removeItem('reone-sub-color');
                        localStorage.removeItem('reone-main-darker');
                        localStorage.removeItem('reone-sub-darker');
                        window.location.reload();
                    });
                }

                const mobileMenuButton = document.getElementById('mobile-menu-button');
                const navMenu = document.getElementById('nav-menu');

                if (mobileMenuButton && navMenu) {
                    const header = document.querySelector('header');
                    const logo = header ? header.querySelector('.text-2xl') : null;
                    mobileMenuButton.addEventListener('click', () => {
                        const isMenuClosed = navMenu.classList.contains('hidden');
                        const mobileMenuClasses = [
                            'fixed', 'inset-0', 'z-40',
                            'bg-main-darker',
                            'pt-20',
                            'px-8',
                            'flex', 'flex-col',
                            'items-start',
                            'space-y-8',
                            'text-xl',
                            'overflow-y-auto'
                        ];

                        const buttonClasses = ['relative', 'z-50'];
                        if (isMenuClosed) {
                            navMenu.classList.remove('hidden');
                            navMenu.classList.add(...mobileMenuClasses);
                            mobileMenuButton.classList.add(...buttonClasses);
                            if (logo) logo.classList.add(...buttonClasses);
                            if(header) header.classList.remove('backdrop-blur-md');
                        } else {
                            navMenu.classList.add('hidden');
                            navMenu.classList.remove(...mobileMenuClasses);
                            mobileMenuButton.classList.remove(...buttonClasses);
                            if (logo) logo.classList.remove(...buttonClasses);
                            if(header) header.classList.add('backdrop-blur-md');
                        }
                    });
                }
            });

        fetch(basePath + 'footer.html')
            .then(response => response.text())
            .then(data => {
                const footerPlaceholder = document.getElementById('footer-placeholder');
                footerPlaceholder.innerHTML = data;
                updateLinkPaths(footerPlaceholder, basePath);
                const mainColor = getComputedStyle(root).getPropertyValue('--main-color').trim();
                const subColor = getComputedStyle(root).getPropertyValue('--sub-color').trim();
                updateLogos(mainColor, subColor);

                // バージョン情報を取得して表示
                fetch(basePath + 'version.json')
                    .then(res => res.json())
                    .then(vData => {
                        const versionEl = document.getElementById('site-version');
                        if (versionEl && vData.version) {
                            versionEl.textContent = `v${vData.version}`;
                        }
                    })
                    .catch(err => console.log('Version info not found'));
            });
    }

    /**
     * テーマカラーを決定し、CSS変数に適用する
     */
    function applyThemeColors() {
        let mainColor = localStorage.getItem('reone-main-color');
        let subColor = localStorage.getItem('reone-sub-color');

        // 色が保存されていない場合は、デフォルトの色を設定する
        if (!mainColor || mainColor === 'null') {
            mainColor = DEFAULT_COLORS.main;
            subColor = DEFAULT_COLORS.sub;
            localStorage.setItem('reone-main-color', mainColor);
            localStorage.setItem('reone-sub-color', subColor);
        }

        const mainDarker = darkenColor(mainColor, 10);
        const subDarker = darkenColor(subColor, 10);

        root.style.setProperty('--main-color', mainColor);
        root.style.setProperty('--sub-color', subColor);
        root.style.setProperty('--main-color-darker', mainDarker);
        root.style.setProperty('--sub-color-darker', subDarker);

        const textOnMain = getTextColorForBackground(mainColor);
        const textOnSub = getTextColorForBackground(subColor);
        root.style.setProperty('--text-on-main', textOnMain);
        root.style.setProperty('--text-on-sub', textOnSub);
        root.style.setProperty('--text-on-main-muted', getMutedTextColor(textOnMain));
        root.style.setProperty('--text-on-sub-muted', getMutedTextColor(textOnSub));

        adjustCardUI(mainColor, subColor);
        updateLogos(mainColor, subColor);
    }

    /**
     * 背景色の明暗に応じてカードUIのスタイルを調整する
     */
    function adjustCardUI(mainColor, subColor) {
        const luminanceThreshold = 150;
        const isMainDark = getLuminance(mainColor) < luminanceThreshold;
        const isSubDark = getLuminance(subColor) < luminanceThreshold;

        // --- デバッグ用出力: works/template アクセス時のみ ---
        if (window.location.pathname.includes('works/template')) {
            console.group('🎨 Color Settings Debug');
            console.log(`Main Color: ${mainColor}`);
            console.log(` - Luminance: ${getLuminance(mainColor).toFixed(2)}`);
            console.log(` - isDark: ${isMainDark} (Threshold: ${luminanceThreshold})`);
            
            console.log(`Sub Color: ${subColor}`);
            console.log(` - Luminance: ${getLuminance(subColor).toFixed(2)}`);
            console.log(` - isDark: ${isSubDark} (Threshold: ${luminanceThreshold})`);
            
            if (isMainDark && isSubDark) console.log('👉 Applied Pattern: 1 (Both Dark)');
            else if (isMainDark && !isSubDark) console.log('👉 Applied Pattern: 2 (Main Dark / Sub Light)');
            else if (!isMainDark && isSubDark) console.log('👉 Applied Pattern: 3 (Main Light / Sub Dark)');
            else console.log('👉 Applied Pattern: 4 (Both Light)');
            console.groupEnd();
        }
        // ---------------------------------------------------

        const styles = {
            black: '#1f2937',
            darkGray: '#4b5563',
            whiteBg: '#ffffff',
            shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            noBorder: '1px solid transparent',
            transparentBg: 'transparent',
            visibleBorder: `1px solid #4b5563`
        };

        if (isMainDark && isSubDark) {
            setCardProperties('main', styles.whiteBg, styles.shadow, styles.noBorder, mainColor, subColor);
            setCardProperties('sub', styles.whiteBg, styles.shadow, styles.noBorder, mainColor, subColor);
        } else if (isMainDark && !isSubDark) {
            setCardProperties('main', styles.whiteBg, styles.shadow, styles.noBorder, mainColor, styles.black);
            setCardProperties('sub', styles.transparentBg, styles.shadow, styles.visibleBorder, mainColor, styles.black);
        } else if (!isMainDark && isSubDark) {
            setCardProperties('main', styles.transparentBg, styles.shadow, styles.visibleBorder, subColor, styles.black);
            setCardProperties('sub', styles.whiteBg, styles.shadow, styles.noBorder, subColor, styles.black);
        } else {
            setCardProperties('main', styles.transparentBg, styles.shadow, styles.visibleBorder, styles.black, styles.darkGray);
            setCardProperties('sub', styles.transparentBg, styles.shadow, styles.visibleBorder, styles.black, styles.darkGray);
        }
    }

    /**
     * 文字色に合わせてロゴ画像を切り替える
     */
    function updateLogos(mainColor, subColor) {
        const textOnMain = getTextColorForBackground(mainColor);
        const textOnSub = getTextColorForBackground(subColor);

        const headerLogo = document.getElementById('header-logo');
        if (headerLogo) {
            const logoFile = (textOnMain === '#ffffff') ? 'logo_white.png' : 'logo_black.png';
            headerLogo.src = basePath + logoFile;
        }

        const footerLogo = document.getElementById('footer-logo');
        if (footerLogo) {
            const logoFile = (textOnSub === '#ffffff') ? 'logo_white.png' : 'logo_black.png';
            footerLogo.src = basePath + logoFile;
        }
    }

    /**
     * カードのCSSプロパティを一括で設定する
     */
    function setCardProperties(type, bg, shadow, border, heading, text) {
        root.style.setProperty(`--card-bg-on-${type}`, bg);
        root.style.setProperty(`--card-shadow-on-${type}`, shadow);
        root.style.setProperty(`--card-border-on-${type}`, border);
        root.style.setProperty(`--card-heading-on-${type}`, heading);
        root.style.setProperty(`--card-text-on-${type}`, text);
    }

    // --- 初期化処理の実行 ---
    loadCommonComponents();
    applyThemeColors();

    /**
     * 上に戻るボタンを生成・制御する（メインページとゲーム説明ページのみ）
     */
    function setupBackToTopButton() {
        const path = window.location.pathname;
        
        const isTargetPage = 
            path.endsWith('/') || 
            path.endsWith('/index.html') && !path.includes('/privacy-policy') && !path.includes('/guideline') ||
            path.includes('/works/');

        if (!isTargetPage) {
            return;
        }

        const button = document.createElement('button');
        button.id = 'back-to-top';
        button.innerHTML = '<i class="fas fa-arrow-up"></i>';
        button.setAttribute('aria-label', 'ページトップへ戻る');
        document.body.appendChild(button);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                button.classList.add('show');
            } else {
                button.classList.remove('show');
            }
        });

        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 関数を実行
    setupBackToTopButton();

    /**
     * ルール・Q&Aの言語切替タブを設定する
     * ページ内のすべてのタブが連動して切り替わる
     */
    function setupLangTabs() {
        const allTabs = document.querySelectorAll('.lang-tab');
        if (allTabs.length === 0) return;

        function switchLang(lang) {
            document.querySelectorAll('.lang-tab').forEach(t => {
                t.classList.toggle('active', t.dataset.lang === lang);
            });
            document.querySelectorAll('.lang-content').forEach(c => {
                c.classList.toggle('active', c.classList.contains('lang-' + lang));
            });
        }

        allTabs.forEach(tab => {
            tab.addEventListener('click', () => switchLang(tab.dataset.lang));
        });
    }

    setupLangTabs();

});
