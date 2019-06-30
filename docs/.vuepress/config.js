module.exports = {
    title: 'TDEM Interface',
    description: 'Specification & core handling service for pluggable extensions inside TweetDeck',
    dest: 'dist',
    serviceWorker: true,
    base: '/',
    themeConfig: {
        docsDir: 'docs',
        docsBranch: 'docs',
        logo: '/logo.svg',
        lastUpdated: 'Last Updated',
        markdown: {
            lineNumbers: true
        },
        nav: [
            { text: 'Synopsis', link: '/synopsis/' },
            { text: 'Core', link: '/core/' },
            { text: 'Storage', link: '/storage/' },
            { text: 'Extensions', link: '/extensions/' },
        ],
        repo: 'tdemapp/interface',
        repoLabel: 'GitHub',
        serviceWorker: {
            updatePopup: true
        },
    }
};