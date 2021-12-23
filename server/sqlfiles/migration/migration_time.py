import datetime
with open('input.txt') as f:
    text = f.read()
    values = text.split('),(')
    for value in values:
        (amount, timestamp) = value.split(',')
        dt = datetime.datetime.fromtimestamp(float(timestamp) / 1e3).strftime('%Y-%m-%d %H:%M:%S')
        print(f"({str(amount)},'{str(dt)}'),", end="")
