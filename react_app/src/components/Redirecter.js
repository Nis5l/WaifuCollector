function redirectIfNecessary(history, data) {
    if (data.status === 10) {
        history.push('/verify');
        return 1;
    }
    if (data.status === 11) {
        history.push('/verify/mail');
        return 2;
    }

    return 0;
}

export default redirectIfNecessary;
