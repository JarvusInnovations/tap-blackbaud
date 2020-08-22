# tap-blackbaud-school

A [Singer](https://www.singer.io/) tap for Blackbaud's [School API](https://developer.blackbaud.com/skyapi/apis/school)

## Configuration

Per Singer specifications, provide configuration via json file:

```bash
tap-blackbaud-school --config ./config.json
```

### Sample `config.json`

```json
{
    "subscriptionKey": "abcdef1234567890...",
    "token": "ey...",
    "school_years": ["2020-2021"],
    "sections": { "level_num": 1234 }
}
```

### Example usage

```bash
mkdir -p .scratch

# prepare target-csv
python3 -m venv .scratch/venv
source .scratch/venv/bin/activate
pip install target-csv
deactivate

# dump data
node bin/tap-blackbaud-school.js --config .scratch/config.json \
    | (cd .scratch/ && ./venv/bin/target-csv)
```
