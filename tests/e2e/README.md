# E2E smoke tests

Chrome DevTools Protocol scripts that launch Microsoft Edge against
`http://localhost:3000/` and walk every route. They currently hard-code the
Windows path to `msedge.exe` (see `edgePath` at the top of each file).

    npm start            # terminal 1
    npm run test:e2e     # terminal 2
