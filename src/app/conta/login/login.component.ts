import { Router, RouterModule } from '@angular/router';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';

import { Observable,fromEvent, merge  } from 'rxjs';

import { CustomValidators } from 'ngx-custom-validators';
import { ToastrService } from 'ngx-toastr';

import { Usuario } from '../models/usuario';
import { ContaService } from './../services/conta.service';
import { ValidationMessages, GenericValidator, DisplayMessage } from './../../utils/generic-form-validation';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  //vai pegar os dados do DOM 
  @ViewChildren(FormControlName, {read: ElementRef }) formInputElements: ElementRef[];

  errors: any[] = [];
  loginForm: FormGroup;
  usuario: Usuario;

  validationMessages: ValidationMessages;
  genericValidator : GenericValidator;
  displayMessage : DisplayMessage = {};

  constructor(private fb: FormBuilder,
              private contaService : ContaService,
              private router : Router,
              private toastr: ToastrService) {

                this.validationMessages = {
                  email: {
                    required: 'Informe o e-mail',
                    email: 'Email inválido'
                  },
                  password: {
                    required: 'Informe a senha',
                    rangeLength: 'A senha deve possuir entre 6 e 15 caracteres'
                  }
                };
                this.genericValidator = new GenericValidator(this.validationMessages);
              }

  ngOnInit(): void {
  
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],     
      password: ['', [Validators.required, CustomValidators.rangeLength([6, 15])]]
    })
  }
  ngAfterViewInit(): void{
    //toda vez que retirar o foco dispara um processamento
    let controlBlurs: Observable<any>[] = this.formInputElements
    .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'))

    merge(...controlBlurs).subscribe(() => {
      this.displayMessage = this.genericValidator.processarMensagens(this.loginForm);      
    })

  }
  login() {
    if (this.loginForm.dirty && this.loginForm.valid){
        this.usuario = Object.assign({}, this.usuario, this.loginForm.value);
        this.contaService.login(this.usuario)
        .subscribe(
          sucesso => {this.processarSucesso(sucesso)},
          falha => { this.processarFalha(falha)}
        );
    }
  }
  processarSucesso(response: any) {
    this.loginForm.reset();
    this.errors = [];

    this.contaService.localStorage.salvarDadosLocaisUsuario(response);
    this.toastr.success('Login realizado com Sucesso!', 'Bem vindo :)');
    this.router.navigate(['/home']);

  }

  processarFalha(fail: any) {
    this.errors = fail.error.errors;
    this.toastr.error('Ocorreu um erro', 'Opa :(');
  }
}
