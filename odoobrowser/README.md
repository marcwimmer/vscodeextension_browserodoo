# Odoo-Browser

* requires wodoo installed:

```bash
pip3 install wodoo
```

## Debugging odoo

* configure debugging port in /.odoo/settings

```bash
...
ODOO_PYTHON_DEBUG_PORT=5678
...
```

* add .vscode/launch.json configuration to your project (pretty straight forward if you choose python attach to remote):

*Dont  forget to update the pathMappings!*

```yml
{
	"configurations": [
		{
			"name": "Python: Remote Attach",
			"type": "python",
			"request": "attach",
			"connect": {
				"host": "localhost",
				"port": 5678
			},
			"pathMappings": [
				{
					"localRoot": "${workspaceFolder}",
					"remoteRoot": "/opt/src"
				}
			]
		}
	]
}``
```

* start debugging the web container and wait for remote debugg:
  
```
odoo debug odoo
debug -w
```

* now attach the debugger