function redirectIfNecessary(history, data) {
    if (data === undefined) return 0;

    switch (data.status) {
        case 10:
            history.push('/verify');
            return 1;
        case 11:
            history.push('/verify/mail');
            return 2;
        case 12:
            history.push('/logout')
            return 3;

        default:
    }

    return 0;
}

export default redirectIfNecessary;
