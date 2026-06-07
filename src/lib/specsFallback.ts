import { VehicleSpecs } from './specsCache';

export function getSimulatedSpecs(vehModel: string, vehYear: string, vehMotor: string = ""): VehicleSpecs {
  const searchModel = String(vehModel || "").toLowerCase();
  
  let simulatedResponse: VehicleSpecs = {
    brand: "Outra",
    engine: vehMotor || "1.6 Flex",
    oilViscosity: "5W-30",
    oilSpecification: "API SP / ACEA A5/B5 / Sintético de Alta Performance",
    oilCapacity: "4.0L (com troca de filtro)",
    oilType: "100% Sintético",
    oilAdditionalNotes: "Lubrificante de alta performance de padrão internacional. Troca recomendada a cada 10.000 km ou 12 meses.",
    commonParts: [
      { name: "Filtro de Óleo", category: "Filtros", oemReference: "Fram PH8A ou similar", shortDescription: "Substituir em toda troca de óleo lubrificante de motor" },
      { name: "Filtro de Ar do Motor", category: "Filtros", oemReference: "Tecfil ARL5097", shortDescription: "Inspecionar a cada 10.000 km, trocar se saturado" },
      { name: "Filtro de Combustível", category: "Filtros", oemReference: "UFI Filters ou Bosch", shortDescription: "Trocar preventivamente a cada 10.000 km" },
      { name: "Pastilha de Freio Dianteira", category: "Frenagem", oemReference: "Peça Cobreq / Fras-le", shortDescription: "Monitore a espessura. Substituição imediata caso abaixo de 3mm" },
      { name: "Jogo de Velas de Ignição", category: "Ignição", oemReference: "NGK Standard ou Iridium", shortDescription: "Substituir a cada 40.000 km em média" }
    ],
    technicalNotes: `Ficha geral para ${vehModel} (Ano ${vehYear} ${vehMotor || ""}). Pressão de pneus recomendada: 32 PSI em condições normais de uso.`
  };

  if (searchModel.includes("civic")) {
    simulatedResponse = {
      brand: "Honda",
      engine: "2.0 16V FlexOne",
      oilViscosity: "0W-20",
      oilSpecification: "API SN/SP / ILSAC GF-5/GF-6 / Sintético",
      oilCapacity: "3.7L (com troca de filtro)",
      oilType: "100% Sintético",
      oilAdditionalNotes: "Óleo fluido de alta economia de combustível e proteção instantânea na partida. A Honda recomenda homologação original.",
      commonParts: [
        { name: "Filtro de Óleo Honda", category: "Filtros", oemReference: "Fram PH5317 / OEM 15400-RTA-003", shortDescription: "Rosca M20. Trocar em toda substituição do óleo de motor." },
        { name: "Filtro de Ar de Cabine", category: "Filtros", oemReference: "Tecfil ACP203", shortDescription: "Substituir anualmente para preservar sistema de ar condicionado" },
        { name: "Jogo de Velas Iridium", category: "Ignição", oemReference: "NGK DILZKR7B11GS", shortDescription: "Velas de Iridium de alta durabilidade. Troca recomendada com 100.000 km" },
        { name: "Filtro de Combustível", category: "Filtros", oemReference: "OEM Honda", shortDescription: "Acoplado ao copo da bomba dentro do tanque. Troca a cada 40.000 km" },
        { name: "Kit Pastilha Freio Dianteira", category: "Frenagem", oemReference: "Bosch Ceramic ou Brembo", shortDescription: "Excelente frenagem térmica. Inspecione em todas as revisões periódicas." }
      ],
      technicalNotes: `Honda Civic ${vehYear} ${vehMotor || ""}. Torque de cabeçote exige precisão em fases sequenciais de torque manual e angular. Conexão OBD standard localizada abaixo do painel do motorista, lado esquerdo.`
    };
  } else if (searchModel.includes("corolla")) {
    simulatedResponse = {
      brand: "Toyota",
      engine: "2.0 Dual VVT-i Flex",
      oilViscosity: "5W-30 (ou 0W-20 para modelos híbridos)",
      oilSpecification: "API SP / ILSAC GF-6 / Sintético de Alta Durabilidade",
      oilCapacity: "4.2L (com troca de filtro)",
      oilType: "100% Sintético",
      oilAdditionalNotes: "Motores Toyota Dual VVT-i requerem lubrificação uniforme de canais para atuação das polias variáveis hidráulicas.",
      commonParts: [
        { name: "Filtro de Óleo Sachê", category: "Filtros", oemReference: "Mann-Filter HU5111x (Refil)", shortDescription: "Elemento de papel ecológico. Troca recomendada a cada lubrificação." },
        { name: "Filtro de Combustível", category: "Filtros", oemReference: "Fram G10225 ou OEM", shortDescription: "Localizado sob o assento traseiro. Trocar preventivamente" },
        { name: "Pastilhas de Freio Dianteiras", category: "Frenagem", oemReference: "Fras-le PD/1415", shortDescription: "Pastilha com sensor acústico mecânico de desgaste" },
        { name: "Correia de Acessórios (Poly-V)", category: "Correias", oemReference: "Gates 6PK1220", shortDescription: "Trocar preventivamente caso apresente fissuras internas" },
        { name: "Velas de Ignição Double Iridium", category: "Ignição", oemReference: "Denso SC20HR11", shortDescription: "Eletrodo ultrafino para melhor queima de mistura pobre." }
      ],
      technicalNotes: `Toyota Corolla ${vehYear} ${vehMotor || ""}. Coxim hidráulico do lado do motor tem tendência a fadiga precoce. Troque caso observe vibração no volante com o veículo em marcha lenta.`
    };
  } else if (searchModel.includes("onix") || searchModel.includes("prisma")) {
    simulatedResponse = {
      brand: "Chevrolet",
      engine: "1.4 8V SPE/4 Flex",
      oilViscosity: "0W-20 (norma Dexos 1)",
      oilSpecification: "Chevrolet Dexos 1 Gen 2 / Gen 3 / API SP",
      oilCapacity: "3.5L (com troca de filtro)",
      oilType: "100% Sintético",
      oilAdditionalNotes: "CRÍTICO: Nos motores de 3 cilindros com correia banhada a óleo, o lubrificante DEVE ser 100% sintético e homologado estritamente Dexos 1, sob risco de dissolução da correia dentada.",
      commonParts: [
        { name: "Filtro de Óleo GM", category: "Filtros", oemReference: "ACDelco 25206953 / Mann W6014", shortDescription: "Pressão de válvula interna calibrada sob medida para motores SPE/4 ou Ecotec Turbo." },
        { name: "Filtro de Combustível Flex", category: "Filtros", oemReference: "Acdelco 19348757", shortDescription: "Trocar preventivamente a cada 10.000 km devido ao álcool combustível." },
        { name: "Correia Dentada Banhada a Óleo", category: "Correias", oemReference: "Gates ou Dayco Banhada", shortDescription: "Troca recomendada a cada 240.000 km ou 15 anos pelo fabricante, mas reduzida preventivamente pelas oficinas a cada 80.000 km." },
        { name: "Aditivo de Radiador Orgânico", category: "Fluidos", oemReference: "ACDelco Orgânico Concentrado", shortDescription: "Diluição correta com 50% de água desmineralizada" },
        { name: "Pastilha de Freio Dianteira", category: "Frenagem", oemReference: "Syl 1098 ou Cobreq N-354", shortDescription: "Substituir preventivamente diante de fadiga ou assobio metálico." }
      ],
      technicalNotes: `GM Onix/Prisma ${vehYear} ${vehMotor || ""}. Atenção especial à tampa do reservatório de expansão de água de arrefecimento e à válvula termostática plástica, que podem apresentar rachaduras invisíveis após ciclos intensos de calor.`
    };
  } else if (searchModel.includes("hb20") || searchModel.includes("creta")) {
    simulatedResponse = {
      brand: "Hyundai",
      engine: "1.0 Kappa 12V Flex",
      oilViscosity: "5W-30 (Motores Kappa 1.0 e Gamma 1.6)",
      oilSpecification: "API SN / SP / ACEA A5/B5 ou superior",
      oilCapacity: "3.6L (com troca de filtro)",
      oilType: "100% Sintético",
      oilAdditionalNotes: "Garante excelente fluidez e evita formação de verniz no cabeçote variável de 12V/16V Dual CVVT da Hyundai.",
      commonParts: [
        { name: "Filtro de Óleo Original", category: "Filtros", oemReference: "Hyundai 26300-35505 / Mann W712/94", shortDescription: "Garante contrapressão de óleo correta nas partidas a frio." },
        { name: "Jogo de Velas de Ignição Nível Premium", category: "Ignição", oemReference: "NGK LKR7D-11D", shortDescription: "Troca regulamentar a cada 40.000 km para motores aspirados de 3 cilindros." },
        { name: "Pastilhas de Freio Cobreq", category: "Frenagem", oemReference: "N-1234", shortDescription: "Alta durabilidade de frenagem na rotina urbana." },
        { name: "Filtro de Ar de Cabine (Ar Condicionado)", category: "Filtros", oemReference: "Filtros Mil FC2309", shortDescription: "Preserve a saúde dos passageiros e o desempenho do ventilador." },
        { name: "Filtro de Ar do Motor", category: "Filtros", oemReference: "Tecfil ARL3113", shortDescription: "Substituir anualmente para evitar restrição no fluxo de admissão." }
      ],
      technicalNotes: `Hyundai HB20 ${vehYear} ${vehMotor || ""}. Direção elétrica ou eletro-hidráulica e folga de tuchos mecânicos devem ser inspecionadas caso haja batidas de válvulas rítmicas com o motor em temperatura de funcionamento.`
    };
  } else if (searchModel.includes("gol") || searchModel.includes("fox") || searchModel.includes("voyage") || searchModel.includes("polo") || searchModel.includes("jetta") || searchModel.includes("virtus") || searchModel.includes("t-cross")) {
    simulatedResponse = {
      brand: "Volkswagen",
      engine: "1.6 8V TotalFlex EA111",
      oilViscosity: "5W-40 (Norma VW 508.88 ou VW 502.00)",
      oilSpecification: "VW 508.88 / 509.99 / API SN ou SP",
      oilCapacity: "4.0L (com troca de filtro)",
      oilType: "100% Sintético",
      oilAdditionalNotes: "CRÍTICO: O uso de óleos fora da especificação VW 508.88 nestes motores EA111 e EA211 causa borra rápida no cárter e desgaste acelerado do comando de válvulas.",
      commonParts: [
        { name: "Filtro de Óleo Blindado", category: "Filtros", oemReference: "OEM 030-115-561-AN / Mann W712/53", shortDescription: "Possui válvula anti-retorno para silenciar o tucho hidráulico logo nas primeiras rotações." },
        { name: "Filtro de Combustível Linha VW", category: "Filtros", oemReference: "Tecfil GI04/7", shortDescription: "Pressão de retenção de 4 Bar. Trocar a cada 10.000 km." },
        { name: "Correia Dentada do Comando (Sincronizadora)", category: "Correias", oemReference: "Contitech CT1167K1 (Kit com Tensor)", shortDescription: "Nos motores EA211 de 3 cilindros, verificar elasticidade. Nos EA111, a troca preventiva máxima é 50.000 km de uso." },
        { name: "Tambor de Freio Traseiro / Lonas", category: "Frenagem", oemReference: "Fras-le", shortDescription: "Garante ancoragem precisa do freio de estacionamento mecânico." },
        { name: "Pastilha de Freio Dianteiro", category: "Frenagem", oemReference: "Bosch Ecopads", shortDescription: "Livre de amianto, excelente dissipação de calor em declives." }
      ],
      technicalNotes: `Volkswagen ${vehModel} ${vehYear} ${vehMotor || ""}. Motores EA111 requerem vigilância contra vazamento no tubo de água plástico de circulação do bloco e folgas no retentor traseiro do virabrequim (flange de vedação traseira).`
    };
  }

  return simulatedResponse;
}
