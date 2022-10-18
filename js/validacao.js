export function valida(input) {
  const tipoDeInput = input.dataset.tipo

  if(validadores[tipoDeInput]) {
      validadores[tipoDeInput](input)
  }

  if(input.validity.valid) {
      input.parentElement.classList.remove('input-container--invalido')
      input.parentElement.querySelector('.input-mensagem-erro').innerHTML = ''
  } else {
      input.parentElement.classList.add('input-container--invalido')
      input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostraMensagemDeErro(tipoDeInput, input)
  }
}

const tiposDeErro = [
  'valueMissing',
  'typeMismatch',
  'patternMismatch',
  'customError'
]

const mensagensDeErro = {
  nome: {
    valueMissing: 'O campo nome não pode estar vazio.'
  },
  email: {
    valueMissing: 'O campo email não pode estar vazio.',
    typeMismatch: 'O email digitado não é válido.'
  },
  senha: {
    valueMissing: 'O campo senha não pode estar vazio.',
    patternMismatch: 'A senha deve conter entre 6 a 12 caracteres, deve conter pelo menos uma letra maiúscula, um número e não deve conter símbolos.'
  },
  dataNascimento: {
    valueMissing: 'O campo data de nascimento não pode estar vazio.',
    customError: 'Você deve ser maior que 18 anos para se cadastrar.'
  },
  cpf: {
    valueMissing: 'O campo cpf não pode estar vazio.',
    customError: 'O CPF não é válido'
  },
  cep: {
    valueMissing: 'O campo cep não pode estar vazio.',
    patternMismatch: ' O cep não é válido',
    customError: 'Não foi possível buscar o cep'
  }, 
  logradouro:{
    valueMissing: 'O campo logradouro não pode estar vazio.'
  },
  cidade:{
    valueMissing: 'O campo cidade não pode estar vazio.'
  },
  estado:{
    valueMissing: 'O campo estado não pode estar vazio.'
  },
  preco: {
    valueMissing: 'O campo preço não pode estar vazio.'
  }
}

const validadores = {
  dataNascimento:input => validaDataNascimento(input),
  cpf:input => validaCpf(input),
  cep:input => recuperarCep(input)
}

function mostraMensagemDeErro(tipoDeInput, input) {
  let mensagem = ''
  tiposDeErro.forEach(erro => {
      if(input.validity[erro]) {
          mensagem = mensagensDeErro[tipoDeInput][erro]
      }
  })
  
  return mensagem
}

function validaDataNascimento(input) {
  const dataRecebida = new Date(input.value)
  let mensagem = ''

  if(!maiorQue18(dataRecebida)) {
      mensagem = 'Você deve ser maior que 18 anos para se cadastrar.'
  }

  input.setCustomValidity(mensagem)
}

function maiorQue18(data) {
  const dataAtual = new Date()
  const dataMais18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate())

  return dataMais18 <= dataAtual
}


function validaCpf(input) {
  const cpfFormatado = input.value.replace(/\D/g, '')
  let mensagem = ''

  if(!checaCpfRepetido(cpfFormatado) || !checaEstruturaCpf(cpfFormatado)) {
    mensagem = 'O CPF não é válido'
  }

  input.setCustomValidity(mensagem);

}

function checaCpfRepetido(cpf) {
  const valoresRpetidos = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999'
  ]

  let cpfValido = true

  valoresRpetidos.forEach(valor => {
    if(valor == cpf){
      cpfValido = false
    }
  })

  return cpfValido
}

function checaEstruturaCpf (cpf) {
  const multiplicador = 10


  return checaDigitoVerificador(cpf, multiplicador)
}

function checaDigitoVerificador(cpf, multiplicador) {
  if(multiplicador >=12) {
    return true
  }

  let multiplicadorInicial = multiplicador
  let soma = 0
  const cpfSemDigitos =  cpf.substr(0, multiplicador -1).split('')
  const digitoVerificador = cpf.charAt(multiplicador - 1)

  for(let contador = 0; multiplicadorInicial > 1 ; multiplicadorInicial-- ){
    soma = soma + cpfSemDigitos[contador] * multiplicadorInicial
    contador++
  }

  if(digitoVerificador == confirmaDigito(soma)) {
    return checaDigitoVerificador(cpf, multiplicador + 1)
  }

  return false
}

function confirmaDigito(soma) {
  return 11 - (soma % 11)
}

function recuperarCep(input) {
  const cep = input.value.replace(/\D/g, '')
  const url = `https://viacep.com.br/ws/${cep}/json`
  const options = {
    method: 'GET',
    mode: 'cors',
    header: {
      'content-type': 'application/json;charset=utf-8'
    }
  }

  if(!input.validity.patternMismatch && !input.validity.valueMissing) {
    fetch(url, options).then(
      response => response.json()
    ).then (
      data => {
        if(data.erro) {
          input.setCustomValidity('Não foi possível buscar o CEP')
          return
        }
        input.setCustomValidity('')
        preencheCamposEndereco(data)
        return
      }
    )
  }
}

function preencheCamposEndereco(data){
  const logradouro = document.querySelector('[data-tipo="logradouro"]')
  const cidade = document.querySelector('[data-tipo="cidade"]')
  const estado = document.querySelector('[data-tipo="estado"]')

  logradouro.value = data.logradouro
  cidade.value = data.localidade
  estado.value = data.uf
}
