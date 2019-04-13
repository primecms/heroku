<p align="center">
  <a href="https://docs.primecms.app"><img alt="Prime" width="330px" src="https://raw.githubusercontent.com/birkir/prime/master/docs/_assets/prime.png" /></a>
</p>
<p align="center"><strong>Open Source GraphQL CMS</strong></p>

[![npm downloads](https://img.shields.io/npm/dt/@primecms/core.svg)](https://www.npmjs.com/package/@primecms/core)
[![npm](https://img.shields.io/npm/v/@primecms/core.svg?maxAge=3600)](https://www.npmjs.com/package/@primecms/core)
[![codecov](https://codecov.io/gh/birkir/prime/branch/master/graph/badge.svg)](https://codecov.io/gh/birkir/prime)
[![CircleCI](https://circleci.com/gh/birkir/prime.svg?style=shield)](https://circleci.com/gh/birkir/prime)
![last commit](https://img.shields.io/github/last-commit/google/skia.svg)
[![license](https://img.shields.io/github/license/birkir/prime.svg)](https://opensource.org/licenses/MIT)

Prime is a standalone, self-hosted, headless CMS with a GraphQL interface powered by TypeScript.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/primecms/heroku)

1. 👉 Click the Heroku button
2. [📖 Read Docs](https://docs.primecms.app)
3. [🌟 Head to GitHub](https://github.com/birkir/prime) and give us a star

Optionally add the following (free) supported Heroku addons: [Cloudinary](https://elements.heroku.com/addons/cloudinary), [Mailgun](https://elements.heroku.com/addons/mailgun), [Sentry](https://elements.heroku.com/addons/sentry) and [Newrelic](https://elements.heroku.com/addons/newrelic).

## Why Prime?

There are a lot of headless SaaS solutions out there, and many of them better than Prime, but sometimes there is a need to host the CMS locally and while most open source projects work well for that, they are missing key features.

> Please don’t forget to star this repo if you found it useful

## Features

- 🖨 Headless GraphQL Interface
- 🚀 Simple to use, yet powerful
- 📐 Slices and Groups fields
- ☑️ Create your own custom fields
- 🇮🇸 🇯🇵 Multiple languages
- 🚧 Preview drafts and releases without publishing
- 🔑 Resource and user access control
- 📆 Plan and schedule releases
- ... and many more

See the [feature comparison](https://docs.primecms.app/#/features) to Prismic, Contentful and Strapi.

## Screenshots

<table>
  <tr>
    <td>
      <img src="https://i.imgur.com/kIJJAwN.png" width="200" alt="List of documents">
    </td>
    <td>
      <img src="https://i.imgur.com/9FLiisc.png" width="200" alt="Edit document">
    </td>
    <td>
      <img src="https://i.imgur.com/gZZLGC5.png" width="200" alt="Edit schema">
    </td>
  </tr>
  <tr>
    <td align="center"><i>Content Management</i></td>
    <td align="center"><i>Content Editing</i></td>
    <td align="center"><i>Schema Modeling</i></td>
  </tr>
</table>

<table>
  <tr>
    <td>
      <img src="https://i.imgur.com/Dim0fPN.png" width="200" alt="Multiple locales">
    </td>
    <td>
      <img src="https://i.imgur.com/jHYiPa5.png" width="200" alt="Set Preview URLs">
    </td>
    <td>
      <img src="https://i.imgur.com/T7q8a2M.png" width="200" alt="Create Releases">
    </td>
  </tr>
  <tr>
    <td align="center"><i>Multiple locales</i></td>
    <td align="center"><i>Set Preview URLs</i></td>
    <td align="center"><i>Create Releases</i></td>
  </tr>
</table>
<table>
  <tr>
    <td>
      <img src="https://i.imgur.com/NnpKUJV.png" width="200" alt="GraphQL Queries">
    </td>
    <td>
      <img src="https://i.imgur.com/p7ZvhFf.png" width="200" alt="GraphQL Mutations">
    </td>
  </tr>
  <tr>
    <td align="center">
      <i>GraphQL Queries</i>
    </td>
    <td align="center">
      <i>GraphQL Mutations</i>
    </td>
  </tr>
</table>

[More screenshots available here](https://imgur.com/gallery/NVDH81P)

## Docker

```sh
git tag 0.3.4-beta.0
git push --tags
docker build -t primecms .
docker login
docker tag primecms primecms/primecms:0.3.4-beta.0
docker push primecms/primecms:0.3.4-beta.0
```