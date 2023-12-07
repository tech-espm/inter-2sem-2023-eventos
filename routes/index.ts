import app = require("teem");

class IndexRoute {
	public async index(req: app.Request, res: app.Response) {
		res.render("index/index");
	}

	public async sobre(req: app.Request, res: app.Response) {
		let opcoes = {
			titulo: "Sobre"
		};

		res.render("index/sobre", opcoes);
	}

	public async cadastro(req: app.Request, res: app.Response) {
		let opcoes = {
			titulo: "Cadastro"
		};

		res.render("index/cadastro", opcoes);
	}

	@app.http.post()
	@app.route.formData()
	public async cadastrar(req: app.Request, res: app.Response) {
		if (!req.body.nome) {
			res.status(400).json("Nome inválido");
			return;
		}

		if (!req.body.email) {
			res.status(400).json("E-mail inválido");
			return;
		}

		if (!req.body.local) {
			res.status(400).json("Local inválido");
			return;
		}

		if (!req.body.data) {
			res.status(400).json("Data inválida");
			return;
		}

		if (!req.body.horario) {
			res.status(400).json("Horário inválido");
			return;
		}

		if (!req.body.estilo) {
			res.status(400).json("Estilo inválido");
			return;
		}

		if (!req.uploadedFiles || !req.uploadedFiles.foto || req.uploadedFiles.foto.mimetype !== "image/jpeg") {
			res.status(400).json("Foto inválida");
			return;
		}

		await app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			let partes = req.body.data.split("/");
			let data = `${partes[2]}-${partes[1]}-${partes[0]}`;

			await sql.query("INSERT INTO evento (nome, email, local, data, horario, estilo) VALUES (?, ?, ?, ?, ?, ?)", [req.body.nome, req.body.email, req.body.local, data, req.body.horario, req.body.estilo]);

			let id: number = await sql.scalar("SELECT last_insert_id()");

			app.fileSystem.saveUploadedFileToNewFile(`public/img/eventos/${id}.jpg`, req.uploadedFiles.foto);

			await sql.commit();
		});

		res.json(true);
	}

	public async eventos(req: app.Request, res: app.Response) {
		let eventos: any[];
		
		await app.sql.connect(async (sql) => {
			eventos = await sql.query("SELECT id, nome, email, local, date_format(data, '%d/%m/%Y') data, horario, estilo FROM evento ORDER BY data DESC");
		});


		let opcoes = {
			titulo: "Eventos",
			eventos: eventos
		};

		res.render("index/eventos", opcoes);
	}
}

export = IndexRoute;
