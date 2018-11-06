/*eslint-env node*/

import 'bootstrap-loader'
import React from 'react'
import { render } from 'react-dom'
import Root from 'Root'
import configureStore from 'configureStore'
import {TextToImage} from './utility/image'

// Set favicon
// let faviconPath = require('!!file?name=favicon.ico!../static/images/favicon.png')
let favicon = document.createElement('link')
favicon.type = 'image/png'
favicon.rel = 'shortcut icon'
// favicon.href = faviconPath
// favicon.href = 'data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T///////8JWPfcAAAACXBIWXMAAABIAAAASABGyWs+AAAAF0lEQVRIx2NgGAWjYBSMglEwCkbBSAcACBAAAeaR9cIAAAAASUVORK5CYII='
favicon.href = TextToImage('oo', 14, '#123456')
document.getElementsByTagName('head')[0].appendChild(favicon)

// Start app
export const store = configureStore()
render(
	<Root store={store}/>,
	document.getElementById('root')
)
