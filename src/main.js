import api from './api';

class App {
    constructor() {
        this.formEl = document.getElementById('form');
        this.listEl = document.getElementById('list');
        this.inputTextEl = document.querySelector('input[type=text]');
        this.inputRadioEl = document.querySelectorAll('input[name=search]');
        this.registerHandlers();
    }

    registerHandlers() {
        this.formEl.onsubmit = (event) => this.addRepository(event);
    }

    setLoading(loading = true) {
        if (loading) {
            let spanEl = document.createElement('span');
            spanEl.appendChild(document.createTextNode('Carregando'));
            spanEl.setAttribute('id', 'loading');

            let loadingEl = document.createElement('i');
            loadingEl.setAttribute('class', 'fa fa-cog fa-spin fa-fw');

            spanEl.appendChild(loadingEl);
            this.formEl.appendChild(spanEl);
        }
        else
            document.getElementById('loading').remove();
    }

    async addRepository(event) {
        event.preventDefault();

        const input = this.inputTextEl.value;
        const radioButton = Array.from(this.inputRadioEl).filter(function (radio) {
            return radio.checked === true;
        })[0].value;

        if (input.length === 0)
            return;

        this.setLoading();
        this.inputTextEl.value = '';
        this.listEl.innerHTML = '';

        try {

            let response;
            const list = [];

            switch (radioButton) {
                case 'user':
                    response = await api.get(`search/users?q=${input}`);

                    response.data['items'].forEach(user => {
                        var { login, id, html_url, avatar_url } = user;
                        list.push({ name: login, description: id, html_url, avatar_url });
                    });
                    break;

                case 'repositories':
                    response = await api.get(`search/repositories?q=${input}`);

                    response.data['items'].forEach(repository => {
                        var { name, description, html_url, owner: { avatar_url } } = repository;
                        list.push({ name, description, html_url, avatar_url });
                    });
                    break;

                case 'repositoryByUser':
                    response = await api.get(`repos/${input}`);
                    
                    var { name, description, html_url, owner: { avatar_url } } = response.data;
                    list.push({ name, description, html_url, avatar_url });
                    break;

                case 'repositoriesByUser':
                    response = await api.get(`users/${input}/repos`);

                    response.data.forEach(repository => {
                        var { name, description, html_url, owner: { avatar_url } } = repository;
                        list.push({ name, description, html_url, avatar_url });
                    });
                    break;
            }

            this.render(list);

        } catch (error) {
            alert('ERRO... não foi possível efetuar a busca');
        }
        finally {
            this.setLoading(false);
        }
    }

    render(list) {
        list.forEach(data => {
            let imgEl = document.createElement('img');
            imgEl.setAttribute('src', data.avatar_url);

            let titleEl = document.createElement('strong');
            titleEl.appendChild(document.createTextNode(data.name));

            let descriptionEl = document.createElement('p');
            descriptionEl.appendChild(document.createTextNode(data.description ?? 'Sem descrição'));

            let linkEl = document.createElement('a');
            linkEl.setAttribute('href', data.html_url);
            linkEl.setAttribute('target', '_blank');
            linkEl.appendChild(document.createTextNode('Acessar'));

            let listItemEl = document.createElement('li');
            listItemEl.appendChild(imgEl);
            listItemEl.appendChild(titleEl);
            listItemEl.appendChild(descriptionEl);
            listItemEl.appendChild(linkEl);

            this.listEl.appendChild(listItemEl);
        });
    }
}

new App();