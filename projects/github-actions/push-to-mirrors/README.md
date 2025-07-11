# Push to Mirrors

This [Github Action](https://github.com/features/actions) will push from a specially-formatted
directory to multiple GitHub mirror repositories.

## Example

```yaml
name: Build
on:
  push:
    branches: [ main ]

jobs:
  build:
    name: Build all projects
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build all projects
        id: build
        run: ...

      - name: Push changed projects
        uses: Automattic/action-push-to-mirrors@v2
        with:
          token: ${{ secrets.API_TOKEN_GITHUB }}
          username: buildbot
          working-directory: ${{ github.workspace }}/build
```

## Usage

This action is intended to be triggered by a `push` event.

```yaml
- uses: Automattic/action-push-to-mirrors@v2
  with:
    # Commit message to use. If omitted, git will be run in the specified
    # `source-directory` to fetch the message used for the commit.
    commit-message:

    # Set to `true` to suppress the addition of "Upstream-Ref" footers in the
    # mirrored commits. Not recommended.
    no-upstream-refs:

    # Directory containing a checkout of the monorepo revision being mirrored.
    # Used to fetch git metadata for the mirror commits, and to find the base
    # commit for new mirror branches.
    source-directory: ${{ github.workspace }}

    # GitHub Access Token. This token must allow for pushing to all relevant
    # branches of all relevant mirror repos.
    token:

    # When checking "Upstream-Ref" to find a base commit for a new mirror
    # branch, only consider this many monorepo commits at most.
    upstream-ref-count:

    # When checking "Upstream-Ref" to find a base commit for a new mirror
    # branch, only consider monorepo commits since this date (in any format
    # accepted by `git log`'s `--since` or `--since-as-filter` parameter).
    upstream-ref-since:

    # Name of the user the token belongs to.
    username:

    # Email address of the user the token belongs to. If omitted, defaults to
    # `${username}@users.noreply.github.com`.
    user-email: username@users.noreply.github.com

    # Directory containing the contents of the mirror repositories to push.
    # See below for details.
    working-directory:
```

## Working directory format

The working directory must have a particular structure.

```
mirrors.txt
Automattic/
├── jetpack-production/
│   ├── .gitignore
│   ├── composer.json
│   └── ...
└── jetpack-beta/
    ├── .gitignore
    ├── composer.json
    └── ...
```

The file `mirrors.txt` lists the mirror repositories to push to, one per line. In this example, it
would contain
```
Automattic/jetpack-production
Automattic/jetpack-beta
```
The action would then push all files from `Automattic/jetpack-production/` to https://github.com/Automattic/jetpack-production
and from `Automattic/jetpack-beta/` to https://github.com/Automattic/jetpack-beta.

Note that any `.gitignore` rules are not applied, _every_ file in the mirror's subdirectory will be
pushed to the mirror. This is because `.gitignore` in the monorepo often ignores built files that
are required in a built mirror.

The action itself will create another file in the working directory, `changes.diff`, containing
a diff of all changes that were pushed.
