const path = require('path')

module.exports = {
    plugins: [
        {
            resolve: 'gatsby-plugin-root-import',
            options: {
                src: path.join(__dirname, 'src'),
            },
        },
        {
            resolve: 'gatsby-plugin-eslint',
            options: {
                test: /\.js$/,
                exclude: /(node_modules|\.cache|public)/,
                stages: ['develop'],
                options: {
                    emitWarning: true,
                    failOnError: false,
                },
            },
        },
        {
            resolve: '@danbruegge/gatsby-plugin-stylelint',
            options: {
                files: 'src/styles/*.scss',
            },
        },
        'gatsby-plugin-sass',
        'gatsby-plugin-offline',
        'gatsby-plugin-react-helmet',
    ],
}
