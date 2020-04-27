const path = require('path')

const config = {
    plugins: [
        {
            resolve: 'gatsby-plugin-root-import',
            options: {
                src: path.join(__dirname, 'src'),
            },
        },
        'gatsby-plugin-sass',
        'gatsby-plugin-offline',
        'gatsby-plugin-react-helmet',
    ],
}

if (process.env.NODE_ENV !== 'production') {
    config.plugins.push(
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
        }
    )
}

module.exports = config
