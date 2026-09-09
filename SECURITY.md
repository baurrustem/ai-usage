# Security policy

Supported code: the latest release and the default development branch. There is no automatic code update mechanism; install a newer source/release ZIP when a fix is available.

If GitHub private vulnerability reporting is enabled for this repository, use **Security → Report a vulnerability**. Otherwise open an issue asking for a private contact channel without exploit details or sensitive data. Do not put tokens, auth files, raw transcripts, database files, snapshots or personal screenshots in a public issue.

Useful private reports describe affected versions, the data boundary involved and a minimal reproduction using synthetic data. Credential exposure, unsafe archive extraction, unintended remote data transmission or local file disclosure are security issues. Missing/stale upstream quota fields are generally compatibility bugs.

The public-file check catches selected credential/path patterns and unexpected source files. It is not a comprehensive secret scanner or an audit guarantee. Maintainers must review release contents and enable GitHub secret scanning/push protection where available before public publication.
