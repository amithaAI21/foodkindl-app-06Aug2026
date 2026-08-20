from django.db import migrations


def add_government_id_url_if_missing(
    apps,
    schema_editor,
):
    Profile = apps.get_model(
        "accounts",
        "Profile",
    )

    table_name = (
        Profile._meta.db_table
    )

    with (
        schema_editor
        .connection
        .cursor()
    ) as cursor:

        existing_columns = {
            column.name
            for column in (
                schema_editor
                .connection
                .introspection
                .get_table_description(
                    cursor,
                    table_name,
                )
            )
        }

    if (
        "government_id_url"
        in existing_columns
    ):
        return

    field = (
        Profile._meta
        .get_field(
            "government_id_url"
        )
    )

    schema_editor.add_field(
        Profile,
        field,
    )


def reverse_noop(
    apps,
    schema_editor,
):
    pass


class Migration(
    migrations.Migration
):

    dependencies = [
        (
            "accounts",
            "0001_initial",
        ),
    ]

    operations = [
        migrations.RunPython(
            add_government_id_url_if_missing,
            reverse_noop,
        ),
    ]
    
    