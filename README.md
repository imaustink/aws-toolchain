# aws-toolchain

## ECS

### logs

```bash
ecs logs -p bafs-dev -c clearwater-ecs -s objects

Options:
      --help     Show help                            [boolean]
      --version  Show version number                  [boolean]
      --debug
  -p, --profile                                      [required]
  -c, --cluster                                      [required]
  -s, --service                                      [required]
  -r, --region                           [default: "us-east-1"]
```

## Lambda

### Logs

```bash
lambda -p bafs-dev logs -s cms-reports-service -n render-template-staging

Options:
      --help          Show help                       [boolean]
      --version       Show version number             [boolean]
      --debug
  -p, --profile                                      [required]
  -s, --service                                      [required]
  -n, --functionName                                 [required]
  -r, --region                           [default: "us-east-1"]
```