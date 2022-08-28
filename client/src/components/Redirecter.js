function redirectIfNecessary(history, err) {
    if (err.response === undefined) return 0;

	//Unathorized
	if(err.response.status == 401) {
		switch (err.response.data.error) {
			case "Not verified":
				history.push('/verify');
				return 1;
			case "Mail not set":
				history.push('/verify/mail');
				return 2;
			default:
				history.push('/logout')
				return 3;
		}
	}

    return 0;
}

export default redirectIfNecessary;
