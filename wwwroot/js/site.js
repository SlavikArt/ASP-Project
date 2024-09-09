document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form.id == 'shop-group-form') {
        e.preventDefault();
        console.log('submit prevented');
        const formData = new FormData(form);
        fetch("/api/group", {
            method: 'POST',
            body: formData
        }).then(r => r.json()).then(j => {
            if (j.status == 'OK') {
                // alert('Додано успішно');
                window.location.reload();
            }
            else {
                alert(j.message);
            }
        });
    }
    else if (form.id == 'shop-product-form') {
        e.preventDefault();
        const formData = new FormData(form);
        fetch("/api/product", {
            method: 'POST',
            body: formData
        }).then(r => r.json()).then(j => {
            if (j.status == 'OK') {
                // alert('Додано успішно');
                window.location.reload();
            } else {
                alert(j.message);
                
                form.querySelectorAll('.invalid-feedback, .valid-feedback').forEach(el => el.remove());
                form.querySelectorAll('.is-invalid, .is-valid').forEach(el => el.classList.remove('is-invalid', 'is-valid'));

                if (j.errors) {
                    for (const [key, value] of Object.entries(j.errors)) {
                        const input = form.querySelector(`[name="${key}"]`);
                        if (input) {
                            if (value) {
                                input.classList.add('is-invalid');
                                const feedback = document.createElement('div');
                                feedback.className = 'invalid-feedback';
                                feedback.innerText = value;
                                input.parentNode.appendChild(feedback);
                            } else {
                                input.classList.add('is-valid');
                                const feedback = document.createElement('div');
                                feedback.className = 'valid-feedback';
                                feedback.innerText = 'Поле заповнено правильно';
                                input.parentNode.appendChild(feedback);
                            }
                        }
                    }
                }
            }
        });
    }

});


document.addEventListener('DOMContentLoaded', () => {
    const authButton = document.getElementById("auth-button");
    if (authButton) authButton.addEventListener('click', authClick);
    else console.error("auth-button not found");

    const logOutButton = document.getElementById("log-out-button");
    if (logOutButton) logOutButton.addEventListener('click', logOutClick);

    const profileEditButton = document.getElementById("profile-edit");
    if (profileEditButton) profileEditButton.addEventListener('click', profileEditClick);

    const profileDeleteButton = document.getElementById("profile-delete");
    if (profileDeleteButton) profileDeleteButton.addEventListener('click', profileDeleteClick);

    const recoveryButton = document.getElementById("recovery-button")
    if (recoveryButton) recoveryButton.addEventListener('click', recoveryClick)

    const closeButton = document.getElementById("close-button")
    if (closeButton) closeButton.addEventListener('click', closeClick)
});

function profileDeleteClick(e) {
    if (confirm("Підтверджуєте видалення облікового запису?")) {
        fetch(
            "/api/auth", {
            method: "UNLINK",
        })
        .then(r => r.json())
        .then(j => {
            if (j.status == "OK") {
                window.location = "/";
            }
            else {
                alert(j.message);
            }
        });
    }
}

function profileEditClick(e) {
    const btn = e.target;
    const isEditFinish = btn.classList.contains('bi-check2-square');
    if (isEditFinish) {
        btn.classList.remove('bi-check2-square');
        btn.classList.add('bi-pencil-square');
    } else {
        btn.classList.add('bi-check2-square');
        btn.classList.remove('bi-pencil-square');
    }

    let changes = {};
    for (let elem of document.querySelectorAll('[profile-editable]')) {
        if (isEditFinish) {
            elem.removeAttribute('contenteditable');
            if (elem.initialText != elem.innerText) {
                const fieldName = elem.getAttribute('profile-editable');
                changes[fieldName] = elem.innerText;
            }
        } else {
            elem.setAttribute('contenteditable', 'true');
            elem.initialText = elem.innerText;
        }
    }

    if (isEditFinish) {
        if (Object.keys(changes).length > 0) {
            console.log(changes);
            fetch("/api/auth", {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(changes)
            }).then(r => r.json())
                .then(j => {
                    if (j.status == "OK") {
                        alert(j.message);
                    } else {
                        for (let elem of document.querySelectorAll('[profile-editable]')) {
                            elem.setAttribute('contenteditable', 'true');
                        }
                        btn.classList.add('bi-check2-square');
                        btn.classList.remove('bi-pencil-square');
                        alert(j.message);
                    }
                });
        } else {
            console.log("No changes");
        }
    }
}

function logOutClick() {
    fetch('/api/auth', {
        method: 'DELETE'
    }).then(r => location.reload());
}

function authClick() {
    const emailInput = document.querySelector('[name="auth-user-email"]');
    if (!emailInput) throw '[name="auth-user-email"] not found';

    const passwordInput = document.querySelector('[name="auth-user-password"]');
    if (!passwordInput) throw '[name="auth-user-password"] not found';

    const recoveryInput = document.querySelector('[name="registration-date"]')
    if (!recoveryInput) console.log('[name="registration-date"] not found')

    const errorDiv = document.getElementById("auth-error");
    if (!errorDiv) throw '"auth-error" not found';
    errorDiv.show = err => {
        errorDiv.style.visibility = "visible";
        errorDiv.innerText = err;
    };
    errorDiv.hide = () => {
        errorDiv.style.visibility = "hidden";
        errorDiv.innerText = "";
    };

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let registrationDate
    if (recoveryInput) registrationDate = recoveryInput.value

    if (email.length === 0) {
        errorDiv.show("Заповніть E-mail");
        return;
    }
    if (password.length === 0) {
        errorDiv.show("Заповніть пароль");
        return;
    }
    if (recoveryInput && registrationDate.length === 0) {
        errorDiv.show("Заповніть дату реєстрації")
        return
    }
    errorDiv.hide()
    console.log(email, password, registrationDate ? registrationDate : 0)

    if (!registrationDate) {
        fetch(`/api/auth?input=${email}&password=${password}`, {
            method: 'GET'
        }).then(r => r.json()).then(j => {
            console.log(j)
            if (j.code != 200) {
                errorDiv.show("Відмова. Перевірьте введені дані")
            } else {
                window.location.reload()
            }
        })
    } else {
        let input = {
            "email": email,
            "password": password,
            "regDate": registrationDate
        }

        fetch(`/api/auth`, {
            method: 'LINK',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(input)
        }).then(r => r.json()).then(j => {
            console.log(j)
            if (j.code != 200) {
                errorDiv.show("Відмова. Перевірьте введені дані")
            } else {
                window.location.reload()
            }
        })
    }
}

function recoveryClick() {
    const recoveryInput = document.querySelector('[name="registration-date"]')
    const emailInput = document.querySelector('[name="auth-user-email"]')
    const recoveryButton = document.querySelector('[id="recovery-button"]')
    const logInButton = document.querySelector('[id="auth-button"]')

    if (!recoveryInput) {
        const newRow = document.createElement('div');
        newRow.classList.add('row');

        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group', 'mb-3');

        const inputGroupText = document.createElement('span');
        inputGroupText.classList.add('input-group-text');
        inputGroupText.id = 'registration-date-addon';
        inputGroupText.innerHTML = '<i class="bi bi-calendar"></i>';

        const newInput = document.createElement('input');
        newInput.type = 'date';
        newInput.name = 'registration-date';
        newInput.classList.add('form-control');
        newInput.placeholder = 'Дата реєстрації';
        newInput.setAttribute('aria-label', 'Дата реєстрації');
        newInput.setAttribute('aria-describedby', 'registration-date-addon');

        inputGroup.appendChild(inputGroupText);
        inputGroup.appendChild(newInput);

        newRow.appendChild(inputGroup);

        document.querySelector('.modal-body').appendChild(newRow);

        recoveryButton.textContent = 'Скасувати'
        logInButton.textContent = 'Відновлення'

        emailInput.placeholder = "Ел. пошта"
    }
    else {
        closeClick()
        recoveryButton.textContent = 'Відновлення'
        logInButton.textContent = 'Вхід'

        emailInput.placeholder = "Ел. пошта / ім'я / дата народження"
    }
}

function closeClick() {
    const registrationDateRow = document.querySelector('[name="registration-date"]')?.closest('.row')
    if (registrationDateRow) registrationDateRow.remove()
}

/*
    fun() { ***** }

    --- await fun() -------
    ---  *****  -------

    --- fun().then(++++) -------
    --- | --------
        | ***** ++++ (C#)

    --- v --------   =============
                  | ***** ++++ (JS)
*/
